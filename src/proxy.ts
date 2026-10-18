import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkServerConfigured } from "@/lib/env";

const isBoardPortal = createRouteMatcher(["/portal(.*)"]);
const isPortalSignIn = createRouteMatcher(["/portal/sign-in(.*)"]);

export default isClerkServerConfigured()
  ? clerkMiddleware(async (auth, req) => {
      if (isBoardPortal(req) && !isPortalSignIn(req)) {
        const signIn = new URL("/portal/sign-in", req.url);
        signIn.searchParams.set("redirect_url", req.url);
        await auth.protect({ unauthenticatedUrl: signIn.toString() });
      }
    })
  : function proxy() {
      return NextResponse.next();
    };

// Only the portal needs Clerk; public pages and API routes skip it entirely.
export const config = {
  matcher: ["/portal", "/portal/:path*"],
};
