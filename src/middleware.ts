import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pages reachable without a session. /reset-password is public because invite
// links may carry the session in the URL hash, which only the browser can read;
// the page itself shows "link expired" when no session can be established.
const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password", "/auth/"];

export async function middleware(request: NextRequest) {
  // Email links can land on the wrong page: when the requested redirect URL isn't on
  // Supabase's allowlist, Supabase falls back to the Site URL root (e.g. "/?code=…").
  // Forward any such link to /auth/confirm instead of letting "/" bounce it to the
  // dashboard and lose the code. The only PKCE links this app emails are password
  // resets, so they continue to /reset-password unless the link says otherwise.
  const { pathname, searchParams } = request.nextUrl;
  if (
    !pathname.startsWith("/auth/") &&
    (searchParams.has("code") || (searchParams.has("token_hash") && searchParams.has("type")))
  ) {
    const confirm = new URL("/auth/confirm", request.url);
    searchParams.forEach((value, key) => confirm.searchParams.set(key, value));
    if (!confirm.searchParams.has("next")) confirm.searchParams.set("next", "/reset-password");
    return NextResponse.redirect(confirm);
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!user && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  // Project Timeline's hashed static bundle and fonts are public code (no data), so they skip the
  // per-request Supabase session check; its data still goes through /api/pm-workspace, which is gated.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|project-timeline/assets/|project-timeline/fonts/|project-timeline/fonts.css|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)"],
};
