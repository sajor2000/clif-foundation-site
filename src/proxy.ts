import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isBoardPortal = createRouteMatcher(["/portal(.*)"]);
const isPortalSignIn = createRouteMatcher(["/portal/sign-in(.*)"]);

const clerkReady = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default clerkReady
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
