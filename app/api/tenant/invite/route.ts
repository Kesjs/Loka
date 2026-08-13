import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTenantCredentialsEmail } from "@/lib/brevo";

/**
 * Génère un mot de passe temporaire lisible (sans caractères ambigus comme
 * 0/O ou 1/l), suffisamment fort pour un premier accès.
 */
function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { locataireId, locataireNom, email } = await request.json();

    if (!locataireId || !email) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // Vérifier que ce locataire appartient bien au propriétaire connecté
    const { data: locataire, error: locataireErr } = await supabase
      .from("locataires")
      .select("id, proprietaire_id, auth_user_id")
      .eq("id", locataireId)
      .maybeSingle();

    if (locataireErr || !locataire || locataire.proprietaire_id !== user.id) {
      return NextResponse.json({ error: "Locataire introuvable" }, { status: 404 });
    }

    const admin = createAdminClient();
    const tempPassword = generateTempPassword();
    let authUserId: string;

    if (locataire.auth_user_id) {
      // Compte déjà créé lors d'une invitation précédente : on lui
      // réattribue simplement un nouveau mot de passe temporaire.
      const { error: updatePwdErr } = await admin.auth.admin.updateUserById(
        locataire.auth_user_id,
        { password: tempPassword }
      );
      if (updatePwdErr) {
        return NextResponse.json(
          { error: "Impossible de réinitialiser le mot de passe du locataire." },
          { status: 500 }
        );
      }
      authUserId = locataire.auth_user_id;
    } else {
      // Premier envoi : on crée le compte Auth du locataire.
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { role: "locataire", nom: locataireNom },
      });

      if (createErr || !created?.user) {
        return NextResponse.json(
          {
            error:
              createErr?.message?.includes("already")
                ? "Cet email est déjà utilisé par un autre compte."
                : "Impossible de créer le compte locataire.",
          },
          { status: 500 }
        );
      }
      authUserId = created.user.id;
    }

    // Lier le compte Auth à la fiche locataire
    const { error: updateErr } = await supabase
      .from("locataires")
      .update({ auth_user_id: authUserId, portal_active: true, activation_token: null })
      .eq("id", locataireId);

    if (updateErr) {
      return NextResponse.json(
        { error: "Compte créé mais liaison à la fiche locataire échouée." },
        { status: 500 }
      );
    }

    // Nom de l'organisation / marque à afficher dans l'email
    const { data: org } = await supabase
      .from("organisations")
      .select("nom, nom_commercial, logo_url")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    const organisationNom = org?.nom_commercial || org?.nom || "Lokka";
    const logoUrl = org?.logo_url || null;

    const emailRes = await sendTenantCredentialsEmail({
      email,
      locataireNom,
      organisationNom,
      tempPassword,
      logoUrl,
    });

    return NextResponse.json({ success: true, emailSent: emailRes.success });
  } catch (error) {
    console.error("Erreur API /api/tenant/invite:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
