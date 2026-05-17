import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["uz-Latn", "uz-Cyrl", "ru", "en"] as const;
const DEFAULT_LOCALE = "uz-Latn";

// Public paths that DO NOT require a session. Locale prefix is normalized away before matching.
const PUBLIC_PATHS = new Set([
  "/login",
]);

// Better-auth default session cookie. Confirmed from better-auth dist/test-utils/test-instance.mjs.
// The proxy is the single source of truth for the cookie name.
const SESSION_COOKIE = "better-auth.session_token";

function stripLocale(pathname: string): { locale: string; rest: string } {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}`) return { locale, rest: "/" };
    if (pathname.startsWith(`/${locale}/`)) {
      return { locale, rest: pathname.slice(locale.length + 1) };
    }
  }
  return { locale: DEFAULT_LOCALE, rest: pathname };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-page requests (handled by matcher too, but defense-in-depth)
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Root path: redirect to default locale login or dashboard
  if (pathname === "/") {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    const target = hasSession ? `/${DEFAULT_LOCALE}/dashboard` : `/${DEFAULT_LOCALE}/login`;
    return NextResponse.redirect(new URL(target, request.url));
  }

  const { locale, rest } = stripLocale(pathname);

  // Public path: let through
  if (PUBLIC_PATHS.has(rest) || PUBLIC_PATHS.has(rest.replace(/\/$/, ""))) {
    return NextResponse.next();
  }

  // Protected path: require session cookie
  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run for everything except api routes, static, image optimizer, and metadata files
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
