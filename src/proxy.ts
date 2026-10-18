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

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
