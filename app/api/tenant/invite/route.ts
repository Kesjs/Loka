import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationScope } from "@/lib/organisation-scope";
import { sendTenantInvitationEmail } from "@/lib/brevo";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { locataireId } = await request.json();

    if (typeof locataireId !== "string" || locataireId.length === 0) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // Le locataire doit appartenir à l'organisation de l'utilisateur courant.
    const scope = await getOrganisationScope(supabase);

    let locataireQuery = supabase
      .from("locataires")
      .select("id, nom, email")
      .eq("id", locataireId);

    locataireQuery = scope.organisationId
      ? locataireQuery.eq("organisation_id", scope.organisationId)
      : locataireQuery.in("proprietaire_id", scope.proprietaireIds);

    const { data: locataire } = await locataireQuery.maybeSingle();

    if (!locataire) {
      return NextResponse.json({ error: "Locataire introuvable" }, { status: 404 });
    }

    if (!locataire.email) {
      return NextResponse.json(
        { error: "Le locataire n'a pas d'adresse email" },
        { status: 400 }
      );
    }

    // Le jeton est généré côté serveur : il ne doit jamais provenir du client.
    const activationToken = randomBytes(32).toString("base64url");

    const { error: tokenError } = await supabase
      .from("locataires")
      .update({ activation_token: activationToken })
      .eq("id", locataire.id);

    if (tokenError) {
      console.error("Erreur génération token d'activation:", tokenError);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
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
      email: locataire.email,
      locataireNom: locataire.nom,
      organisationNom,
      activationToken,
      logoUrl,
    });

    return NextResponse.json({ success: true, emailSent: emailRes.success });
  } catch (error) {
    console.error("Erreur API /api/tenant/invite:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
