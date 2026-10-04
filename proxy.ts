import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PORTAL = /^\/portal(\/|$)/;
const PUBLIC_PORTAL = ["/portal/login"];

function robots(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res;
}

export async function proxy(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return robots(NextResponse.next());

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) req.cookies.set(name, value);
        res = NextResponse.next({ request: req });
        for (const { name, value, options } of toSet)
          res.cookies.set(name, value, options);
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect harus membawa cookie sesi terbaru — kalau tidak, browser
  // memakai token basi dan proxy/layout saling memantulkan (loop 307).
  const redirectTo = (dest: URL) => {
    const r = NextResponse.redirect(dest);
    for (const c of res.cookies.getAll()) r.cookies.set(c.name, c.value);
    return robots(r);
  };

  const path = req.nextUrl.pathname;
  if (PORTAL.test(path) && !PUBLIC_PORTAL.some((p) => path.startsWith(p))) {
    if (!user) {
      const login = new URL("/portal/login", req.url);
      login.searchParams.set("next", path);
      return redirectTo(login);
    }
  }
  if (path.startsWith("/portal/login") && user) {
    return redirectTo(new URL("/portal", req.url));
  }
  return robots(res);
}

export const config = { matcher: ["/portal/:path*"] };
