import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === "/" || pathname.startsWith("/auth");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  
  // Routes publiques accessibles sans authentification
  const PUBLIC_ROUTES = [
    "/",
    "/contact",
    "/a-propos",
    "/blog",
    "/careers",
    "/cgu",
    "/confidentialite",
    "/auth",
    "/login",
  ];
  
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (user) {
    if (isAuthRoute && pathname !== "/onboarding" && pathname !== "/dashboard/home") {
      return NextResponse.redirect(new URL("/dashboard/home", request.url));
    }

    // On ne connaît le statut d'onboarding qu'une fois connecté : on le
    // vérifie avant de laisser passer vers une route protégée.
    const { data: proprietaire } = await supabase
      .from("proprietaire")
      .select("onboarding_complete")
      .eq("id", user.id)
      .maybeSingle();

    const onboardingComplete = proprietaire?.onboarding_complete ?? false;

    if (!onboardingComplete && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (onboardingComplete && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/dashboard/home", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
