"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, planKeyFromId } from "@/lib/billing/config";

type AnalysisResult = {
  summary: string;
  audience: string;
  painPoints: string[];
  promise: string;
  positioning: string;
  differentiators: string[];
  competitorInsights?: string[];
};

type StrategyResult = {
  objective: string;
  channels: string[];
  messagingPillars: string[];
  creativeDirections: string[];
  adAngles: string[];
  psychologicalAngles: Array<{
    name: string;
    painPoint: string;
    hooks: { fear: string; curiosity: string; roi: string };
    cta: string;
  }>;
  visualBrief: string;
  ugcScript: string;
};

type GeneratedInsights = {
  analysis: AnalysisResult;
  strategy: StrategyResult;
  variants: Array<{ kind: "hook" | "copy"; content: Record<string, string>; position: number }>;
};

function clean(value: string | null | undefined) {
  return value?.trim() || "";
}

function parseGeneratedContent(content: string): GeneratedInsights {
  try {
    const parsed = JSON.parse(content) as GeneratedInsights;
    const angles = parsed.strategy?.psychologicalAngles;
    const hasRequiredAngles = Array.isArray(angles)
      && ["Time and fatigue", "Money and cost", "Curiosity and pattern break"].every((name) => {
        const angle = angles.find((item) => item.name?.toLowerCase() === name.toLowerCase());
        return Boolean(angle?.painPoint && angle.hooks?.fear && angle.hooks?.curiosity && angle.hooks?.roi && angle.cta);
      });
    if (!parsed.analysis?.summary || !parsed.analysis?.audience || !parsed.strategy?.objective
      || !hasRequiredAngles || !parsed.strategy.visualBrief || !parsed.strategy.ugcScript
      || !Array.isArray(parsed.variants)) {
      throw new Error("The AI response did not match Pitlo's output format.");
    }
    return parsed;
  } catch {
    throw new Error("The AI returned an invalid response. Please try again.");
  }
}

function isPrivateIp(address: string) {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, "");
  if (isIP(normalized) === 4) {
    const octets = normalized.split(".").map(Number);
    const [first, second] = octets;
    return first === 0 || first === 10 || first === 127 || first >= 224
      || (first === 100 && second >= 64 && second <= 127)
      || (first === 169 && second === 254)
      || (first === 172 && second >= 16 && second <= 31)
      || (first === 192 && (second === 0 || second === 168))
      || (first === 198 && (second === 18 || second === 19))
      || (first === 203 && second === 0);
  }
  if (isIP(normalized) === 6) {
    return normalized === "::" || normalized === "::1"
      || normalized.startsWith("fc") || normalized.startsWith("fd")
      || normalized.startsWith("fe8") || normalized.startsWith("fe9")
      || normalized.startsWith("fea") || normalized.startsWith("feb")
      || normalized.startsWith("ff")
      || normalized.startsWith("::ffff:127.")
      || normalized.startsWith("::ffff:10.")
      || normalized.startsWith("::ffff:192.168.");
  }
  return true;
}

async function validatePublicUrl(value: string) {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error("Product URL is not valid.");
  }
  if (parsedUrl.protocol !== "https:") throw new Error("Product URL must use HTTPS.");
  if (parsedUrl.username || parsedUrl.password || parsedUrl.port) throw new Error("Product URL must not contain credentials or a custom port.");
  const addresses = isIP(parsedUrl.hostname)
    ? [parsedUrl.hostname]
    : (await lookup(parsedUrl.hostname, { all: true })).map(({ address }) => address);
  if (!addresses.length || addresses.some(isPrivateIp)) throw new Error("Product URL must point to a public host.");
  return parsedUrl;
}

async function readProductPage(url: string) {
  let parsedUrl = await validatePublicUrl(url);
  let response: Response | undefined;
  for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
    response = await fetch(parsedUrl, {
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) break;
    const location = response.headers.get("location");
    if (!location || redirectCount === 3) throw new Error("The product page redirected too many times.");
    parsedUrl = await validatePublicUrl(new URL(location, parsedUrl).toString());
  }
  if (!response) throw new Error("The product page could not be fetched.");
  if (!response.ok) throw new Error("The product page could not be fetched. Check the URL and try again.");
  if (!(response.headers.get("content-type") || "").includes("text/html")) {
    throw new Error("The product URL does not contain an HTML page.");
  }
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 250_000) {
    throw new Error("The product page is too large to analyze.");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("The product page returned an empty response.");
  const decoder = new TextDecoder();
  let html = "";
  while (html.length < 250_000) {
    const { done, value } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
  }
  await reader.cancel();
  return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8_000);
}

async function generateWithAi(apiKey: string, product: { name: string; url: string; description: string; adRequest: string; pageText: string; competitorText: string; variationStyle: string; brandContext: Record<string, string> }) {
  const configuredModel = clean(process.env.AI_MODEL) || "gemini-2.5-flash-lite";
  const models = Array.from(new Set([
    configuredModel,
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
  ]));
  const systemPrompt = `You are Pitlo's direct-response advertising strategist. Analyze the product and return only valid JSON.
Use this exact structure:
{"analysis":{"summary":"string","audience":"string","painPoints":["string"],"promise":"string","positioning":"string","differentiators":["string"],"competitorInsights":["string"]},"strategy":{"objective":"string","channels":["string"],"messagingPillars":["string"],"creativeDirections":["string"],"adAngles":["string"],"psychologicalAngles":[{"name":"Time and fatigue","painPoint":"string","hooks":{"fear":"string","curiosity":"string","roi":"string"},"cta":"string"},{"name":"Money and cost","painPoint":"string","hooks":{"fear":"string","curiosity":"string","roi":"string"},"cta":"string"},{"name":"Curiosity and pattern break","painPoint":"string","hooks":{"fear":"string","curiosity":"string","roi":"string"},"cta":"string"}],"visualBrief":"string","ugcScript":"string"},"variants":[{"kind":"hook","content":{"title":"string","body":"string","cta":"string","angle":"string","visualBrief":"string","ugcScript":"string"},"position":0},{"kind":"copy","content":{"title":"string","body":"string","cta":"string","angle":"string","visualBrief":"string","ugcScript":"string"},"position":0}]}
Never produce generic academic slogans such as "Market with confidence" or "Clarity over noise". Do not write a strategy report; write copy a media buyer can paste directly into Facebook Ads Manager or TikTok Ads. Make every output direct-response focused, concrete, and conversion-oriented. For each of these three required angles—Time and fatigue, Money and cost, Curiosity and pattern break—write a real pain point, three psychological hooks (Fear, Curiosity, and Logic/ROI), and a clear CTA. Also provide a practical Canva/Figma visual brief and a short video/UGC script with 0-3 second hook and 3-10 second body. Generate at least 3 painPoints, 3 differentiators, 3 channels, 3 messagingPillars, 3 creativeDirections, 3 adAngles, 2 hooks, and 2 ad copies. Use the requested variation style for the variants. If competitor text is empty, return an empty competitorInsights array. Write every user-facing value in clear, natural English for a global audience. Be specific, credible, and avoid exaggerated claims.`;
  const userPrompt = `Product information:\n${JSON.stringify(product)}`;
  const request = (requestModel: string) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(requestModel)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
    }),
    cache: "no-store",
  });

  let response = await request(models[0]);
  let model = models[0];
  for (let attempt = 0; attempt < 3 && [429, 500, 502, 503, 504].includes(response.status); attempt += 1) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 10_000)
      : 2000 * (attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, delay));
    response = await request(model);
  }
  if (!response.ok && [404, 500, 502, 503, 504].includes(response.status)) {
    for (const fallbackModel of models.slice(1)) {
      console.warn(`Gemini model ${model} returned HTTP ${response.status}; trying ${fallbackModel}.`);
      response = await request(fallbackModel);
      model = fallbackModel;
      if (response.ok) break;
    }
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("AI provider request failed:", response.status, detail.slice(0, 500));
    if (response.status === 401 || response.status === 403) {
      throw new Error("The Gemini API key is invalid or is not authorized for this model.");
    }
    if (response.status === 404) {
      throw new Error(`The Gemini model was not found. Check AI_MODEL (last attempted model: ${model}).`);
    }
    if (response.status === 429) {
      throw new Error("The Gemini usage quota has been exceeded. Please wait and try again.");
    }
    throw new Error(`The Gemini request failed (HTTP ${response.status}). Check the provider details in the server logs.`);
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
  if (!content) throw new Error("The AI provider returned an empty response. Please try again.");
  return parseGeneratedContent(content);
}

export async function generateProjectInsights(formData: FormData) {
  const projectId = clean(String(formData.get("project_id") ?? ""));
  if (!projectId) throw new Error("Project ID is required.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const apiKey = clean(process.env.AI_PROVIDER_API_KEY || process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Add AI_PROVIDER_API_KEY to the server environment variables.");
  }
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_id, status, cancelled")
    .eq("user_id", user.id)
    .maybeSingle();
  const { data: brand } = await supabase
    .from("profiles")
    .select("brand_name, brand_description, brand_voice, brand_values, preferred_words, avoid_words")
    .eq("id", user.id)
    .maybeSingle();
  const activePlan = subscription && !subscription.cancelled && ["active", "on_trial", "paused"].includes(subscription.status)
    ? planKeyFromId(subscription.plan_id)
    : "free";
  const monthlyQuota = PLAN_LIMITS[activePlan].analyses;
  const { data: quotaAvailable, error: quotaError } = await supabase.rpc("consume_ai_generation", {
    p_user_id: user.id,
    p_limit: monthlyQuota,
  });
  if (quotaError) {
    console.error("AI quota check failed:", quotaError.message);
    throw new Error("The AI usage quota could not be checked. Apply the Supabase migrations.");
  }
  if (!quotaAvailable) {
    throw new Error(`Your monthly AI analysis quota is full (${monthlyQuota} analyses). Please try again next month.`);
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("name, product_url, product_description, ad_request, competitors")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) throw new Error("Project could not be found.");

  const pageText = await readProductPage(clean(project.product_url));
  const competitorText = (await Promise.all((project.competitors ?? []).map(async (competitorUrl) => {
    try {
      return `${competitorUrl}\n${await readProductPage(competitorUrl)}`;
    } catch (error) {
      console.warn("Could not read competitor URL:", competitorUrl, error instanceof Error ? error.message : "unknown error");
      return "";
    }
  }))).filter(Boolean).join("\n\n").slice(0, 20_000);
  const variationStyle = clean(String(formData.get("variation_style") ?? "")) || "balanced";
  const { analysis, strategy, variants } = await generateWithAi(apiKey, {
    name: clean(project.name),
    url: clean(project.product_url),
    description: clean(project.product_description),
    adRequest: clean(project.ad_request),
    pageText,
    competitorText,
    variationStyle,
    brandContext: {
      name: brand?.brand_name ?? "",
      description: brand?.brand_description ?? "",
      voice: brand?.brand_voice ?? "",
      values: brand?.brand_values ?? "",
      preferredWords: brand?.preferred_words ?? "",
      avoidWords: brand?.avoid_words ?? "",
    },
  });

  const { error: clearVariantsError } = await supabase.from("ad_variants").delete().eq("project_id", projectId).eq("user_id", user.id);
  if (clearVariantsError) throw new Error(clearVariantsError.message);

  const { error: analysisError } = await supabase.from("product_analyses").insert({
    project_id: projectId,
    user_id: user.id,
    result: analysis,
    status: "complete",
  });
  if (analysisError) throw new Error(analysisError.message);

  const { error: strategyError } = await supabase.from("advertising_strategies").insert({
    project_id: projectId,
    user_id: user.id,
    result: strategy,
  });
  if (strategyError) throw new Error(strategyError.message);

  const { error: variantsError } = await supabase.from("ad_variants").insert(
    variants.map((variant) => ({ ...variant, project_id: projectId, user_id: user.id })),
  );
  if (variantsError) throw new Error(variantsError.message);

  revalidatePath(`/projects/${projectId}`);
}

export async function generateMoreHooks(
  _previousState: { error?: string; success?: string },
  formData: FormData,
) {
  const projectId = clean(String(formData.get("project_id") ?? ""));
  const mode = clean(String(formData.get("mode") ?? "")) || "more-hooks";
  const source = clean(String(formData.get("source") ?? ""));
  if (!projectId) return { error: "Project ID is required." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to generate variants." };
  const apiKey = clean(process.env.AI_PROVIDER_API_KEY || process.env.GEMINI_API_KEY);
  if (!apiKey) return { error: "Gemini API key is not configured on the server." };

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_id, status, cancelled")
    .eq("user_id", user.id)
    .maybeSingle();
  const activePlan = subscription && !subscription.cancelled && ["active", "on_trial", "paused"].includes(subscription.status)
    ? planKeyFromId(subscription.plan_id)
    : "free";
  const { data: quotaAvailable, error: quotaError } = await supabase.rpc("consume_ai_generation", {
    p_user_id: user.id,
    p_limit: PLAN_LIMITS[activePlan].analyses,
  });
  if (quotaError || !quotaAvailable) return { error: quotaError?.message ?? "Monthly AI quota reached." };

  const { data: project } = await supabase
    .from("projects")
    .select("name, product_description")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!project) return { error: "Project could not be found." };

  const modeInstruction = mode === "aggressive"
    ? "Make the hooks bold, urgent, and sales-focused without making unsupported claims."
    : mode === "soft"
      ? "Make the hooks empathetic, human, and storytelling-led while still including a clear CTA."
      : "Create three distinct direct-response hooks for A/B testing.";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(clean(process.env.AI_MODEL) || "gemini-2.5-flash-lite")}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: `Return only valid JSON in this shape: {"variants":[{"kind":"hook","content":{"title":"string","body":"string","cta":"string","angle":"string"},"position":0}]}. ${modeInstruction} Never use generic slogans. Keep copy ready to paste into Meta or TikTok.` }],
        },
        contents: [{ role: "user", parts: [{ text: `Product: ${project.name}\nDescription: ${project.product_description ?? ""}\nExisting creative: ${source}` }] }],
        generationConfig: { temperature: 0.8, responseMimeType: "application/json" },
      }),
      cache: "no-store",
    });
    if (!response.ok) return { error: `Gemini request failed (HTTP ${response.status}).` };
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const content = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
    if (!content) return { error: "Gemini returned an empty response." };
    const parsed = JSON.parse(content) as { variants?: Array<{ kind: "hook"; content: Record<string, string>; position: number }> };
    if (!parsed.variants?.length || parsed.variants.some((variant) => !variant.content?.title || !variant.content?.body || !variant.content?.cta)) {
      return { error: "Gemini returned incomplete hook variants. Please try again." };
    }
    const { data: latest } = await supabase
      .from("ad_variants")
      .select("position")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const startPosition = (latest?.position ?? -1) + 1;
    const { error } = await supabase.from("ad_variants").insert(
      parsed.variants.map((variant, index) => ({
        project_id: projectId,
        user_id: user.id,
        kind: "hook" as const,
        content: variant.content,
        position: startPosition + index,
      })),
    );
    if (error) return { error: error.message };
    revalidatePath(`/projects/${projectId}`);
    return { success: "Three new hook variants generated." };
  } catch (error) {
    console.error("Could not generate hook variants:", error);
    return { error: "Could not generate hook variants. Please try again." };
  }
}
