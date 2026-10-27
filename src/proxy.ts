import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

// /dashboard and /sw/dashboard (and anything below)
const DASHBOARD = /^(?:\/sw)?\/dashboard(?:\/|$)/;
const LOGIN = /^(?:\/sw)?\/login(?:\/|$)/;

export default async function proxy(request: NextRequest) {
  const response = intl(request);

  // Only staff pages need the Supabase session; public pages stay cacheable.
  const { pathname } = request.nextUrl;
  if (!DASHBOARD.test(pathname) && !LOGIN.test(pathname)) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Refreshes the session cookie when needed; getClaims() verifies the JWT.
  const { data } = await supabase.auth.getClaims();

  if (DASHBOARD.test(pathname) && !data?.claims) {
    const login = request.nextUrl.clone();
    login.pathname = pathname.startsWith("/sw/") ? "/sw/login" : "/login";
    login.search = "";
    const redirect = NextResponse.redirect(login);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
