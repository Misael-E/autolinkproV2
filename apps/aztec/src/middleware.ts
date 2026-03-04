import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";
import { DEFAULT_LOCATION } from "./lib/constants";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

const getLocationFromPath = (pathname: string) => {
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg ?? DEFAULT_LOCATION;
};

const stripLocation = (pathname: string) => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  return "/" + parts.slice(1).join("/");
};

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const pathname = req.nextUrl.pathname;
  const normalizedPath = stripLocation(pathname);
  const location = getLocationFromPath(pathname);

  for (const { matcher, allowedRoles } of matchers) {
    if (
      matcher({
        ...req,
        nextUrl: { ...req.nextUrl, pathname: normalizedPath },
      } as any)
    ) {
      if (!role || !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL(`/${location}/${role}`, req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
