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
    if (!parsed.analysis?.summary || !parsed.analysis?.audience || !parsed.strategy?.objective || !Array.isArray(parsed.variants)) {
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
  const model = process.env.AI_MODEL || "gemini-flash-lite-latest";
  const systemPrompt = `You are Pitlo's global English-speaking advertising strategist. Analyze the product and return only valid JSON.
Use this exact structure:
{"analysis":{"summary":"string","audience":"string","painPoints":["string"],"promise":"string","positioning":"string","differentiators":["string"],"competitorInsights":["string"]},"strategy":{"objective":"string","channels":["string"],"messagingPillars":["string"],"creativeDirections":["string"],"adAngles":["string"]},"variants":[{"kind":"hook","content":{"title":"string","body":"string","angle":"string"},"position":0},{"kind":"copy","content":{"title":"string","body":"string","cta":"string","angle":"string"},"position":0}]}
Generate at least 3 painPoints, 3 differentiators, 3 channels, 3 messagingPillars, 3 creativeDirections, 3 adAngles, 2 hooks, and 2 ad copies. Use the requested variation style for the variants. If competitor text is empty, return an empty competitorInsights array. Write every user-facing value in clear, natural English for a global audience. Be specific, credible, and avoid exaggerated claims.`;
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

  let response = await request(model);
  for (let attempt = 0; attempt < 3 && [429, 500, 502, 503, 504].includes(response.status); attempt += 1) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 10_000)
      : 2000 * (attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, delay));
    response = await request(model);
  }
  if (!response.ok && [500, 502, 503, 504].includes(response.status) && model !== "gemini-flash-lite-latest") {
    console.warn(`Gemini model ${model} returned HTTP ${response.status}; trying gemini-flash-lite-latest.`);
    response = await request("gemini-flash-lite-latest");
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("AI provider request failed:", response.status, detail.slice(0, 500));
    if (response.status === 401 || response.status === 403) {
      throw new Error("Gemini API anahtarı geçersiz veya bu model için yetkili değil.");
    }
    if (response.status === 404) {
      throw new Error(`Gemini modeli bulunamadı: ${model}. AI_MODEL değerini kontrol edin.`);
    }
    if (response.status === 429) {
      throw new Error("Gemini kullanım kotası aşıldı. Biraz bekleyip tekrar deneyin.");
    }
    throw new Error(`Gemini isteği başarısız oldu (HTTP ${response.status}). Terminal logundaki sağlayıcı detayını kontrol edin.`);
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
  if (!content) throw new Error("AI sağlayıcısı boş yanıt döndürdü. Lütfen tekrar deneyin.");
  return parseGeneratedContent(content);
}

export async function generateProjectInsights(formData: FormData) {
  const projectId = clean(String(formData.get("project_id") ?? ""));
  if (!projectId) throw new Error("Project ID is required.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const apiKey = clean(process.env.AI_PROVIDER_API_KEY);
  if (!apiKey) throw new Error("AI_PROVIDER_API_KEY is not configured on the server.");
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
    throw new Error("AI kullanım kotası kontrol edilemedi. Supabase migration'larını uygulayın.");
  }
  if (!quotaAvailable) {
    throw new Error(`Aylık AI analiz kotanız doldu (${monthlyQuota} analiz). Gelecek ay tekrar deneyin.`);
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
