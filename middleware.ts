import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    // Signed-in users go to their dashboard; everyone else can start
    // chatting immediately as a guest.
    const destination = sessionCookie ? "/dashboard" : "/chat";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/chat/")) {
    // A specific saved conversation belongs to an account - guests don't
    // have one, so send them to the guest-accessible /chat landing instead.
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/chat", request.url));
    }
    return NextResponse.next();
  }

  // "/chat" itself is guest-accessible - let it through either way.
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/chat/:path*"],
};
