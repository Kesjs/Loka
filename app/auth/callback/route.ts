import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Reçoit le lien de confirmation email envoyé par Supabase
// (emailRedirectTo dans SignUpForm) et échange le code contre une session.
// Le middleware prend ensuite le relais pour rediriger vers /onboarding
// ou /home selon le statut onboarding_complete.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Code manquant ou invalide/expiré : retour vers l'écran de connexion
  return NextResponse.redirect(`${origin}/auth?error=confirmation-failed`);
}
