import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTenantInvitationEmail } from "@/lib/brevo";
import { apiErrorResponse } from "@/lib/api/errorHandler";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { locataireId, locataireNom, email, token } = await request.json();

    if (!locataireId || !email || !token) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // Récupérer les infos de l'organisation du bailleur/gestionnaire
    const { data: org } = await supabase
      .from("organisations")
      .select("nom, nom_commercial, logo_url")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    const { data: prop } = await supabase
      .from("proprietaire")
      .select("nom")
      .eq("id", user.id)
      .maybeSingle();

    const organisationNom = org?.nom_commercial || org?.nom || prop?.nom || "Loka";
    const logoUrl = org?.logo_url || null;

    // Envoi de l'email transactionnel Brevo
    const emailRes = await sendTenantInvitationEmail({
      email,
      locataireNom,
      organisationNom,
      activationToken: token,
      logoUrl,
    });

    if (!emailRes.success) {
      console.error("Envoi de l'invitation locataire échoué :", emailRes.error);
      return NextResponse.json(
        {
          error:
            emailRes.error ||
            "L'invitation n'a pas pu être envoyée au locataire.",
          code: "EMAIL_NOT_SENT",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    return apiErrorResponse(error, "Erreur serveur");
  }
}
