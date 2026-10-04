import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/projects")) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = { matcher: ["/dashboard/:path*", "/projects/:path*", "/auth/callback"] };
