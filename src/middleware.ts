import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function securityHeaders(nonce: string) {
  const developmentDirective = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "frame-src 'none'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      `style-src 'self' 'nonce-${nonce}'`,
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentDirective}`,
      "connect-src 'self' https://hqsxrgzsuwvkifmumioc.supabase.co wss://hqsxrgzsuwvkifmumioc.supabase.co",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; "),
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), usb=(), payment=()",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const requestWithNonce = new NextRequest(request, { headers: requestHeaders });
  const { response, user } = await updateSession(requestWithNonce);
  const { pathname } = request.nextUrl;
  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/projects")) && !user) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    Object.entries(securityHeaders(nonce)).forEach(([key, value]) => redirectResponse.headers.set(key, value));
    return redirectResponse;
  }
  Object.entries(securityHeaders(nonce)).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
