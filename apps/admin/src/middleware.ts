import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/auth", "/setup"];

/** Refreshes the Supabase session and keeps signed-out visitors on the login page. */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const path = request.nextUrl.pathname;

  if (!url || !key) {
    // Production without Supabase: show setup instructions only.
    if (process.env.NODE_ENV === "production") {
      return path === "/setup" ? NextResponse.next() : NextResponse.redirect(new URL("/setup", request.url));
    }
    // Local preview: a role cookie stands in for a session.
    const signedIn = request.cookies.has("vanam_preview_role");
    const isPublicPath = PUBLIC.some((p) => path === p || path.startsWith(`${p}/`));
    if (!signedIn && !isPublicPath) {
      const login = new URL("/login", request.url);
      if (path !== "/") login.searchParams.set("next", path);
      return NextResponse.redirect(login);
    }
    if (signedIn && path === "/login") return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet: { name: string; value: string; options: CookieOptions }[]) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isPublic = PUBLIC.some((p) => path === p || path.startsWith(`${p}/`));

  if (!user && !isPublic) {
    const login = new URL("/login", request.url);
    if (path !== "/") login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }
  if (user && path === "/login") return NextResponse.redirect(new URL("/", request.url));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|preview-uploads).*)"],
};
