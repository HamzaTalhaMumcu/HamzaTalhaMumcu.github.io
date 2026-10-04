import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const next = url.searchParams.get("next") === "/update-password" ? "/update-password" : "/dashboard";
  if (error) {
    const message = errorDescription || error;
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
  }
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url));
    }
  }
  return NextResponse.redirect(new URL(next, request.url));
}
