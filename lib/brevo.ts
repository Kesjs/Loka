/**
 * lib/brevo.ts
 *
 * Helper pour l'envoi d'emails transactionnels du Portail Locataire via
 * Brevo API. Le locataire reçoit directement ses identifiants de connexion
 * (email + mot de passe temporaire) et le lien vers /tenant/login — pas de
 * lien d'activation à part : c'est le propriétaire qui donne l'accès.
 */

interface SendTenantCredentialsParams {
  email: string;
  locataireNom: string;
  organisationNom: string;
  tempPassword: string;
  logoUrl?: string | null;
}

export async function sendTenantCredentialsEmail({
  email,
  locataireNom,
  organisationNom,
  tempPassword,
  logoUrl,
}: SendTenantCredentialsParams): Promise<{ success: boolean; error?: string }> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://loka.bj";
  const loginUrl = `${baseUrl}/tenant/login`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; }
          .header { text-align: center; margin-bottom: 24px; }
          .credentials { background-color: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
          .credentials p { margin: 4px 0; font-size: 14px; color: #0f172a; }
          .credentials strong { color: #059669; }
          .btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; margin-top: 12px; }
          .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="${organisationNom}" height="40" style="margin-bottom: 12px;">` : `<h2 style="color: #059669; margin: 0;">${organisationNom}</h2>`}
          </div>
          <h3 style="color: #0f172a; margin-bottom: 12px;">Bonjour ${locataireNom},</h3>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Votre bailleur <strong>${organisationNom}</strong> vous a ouvert un accès à votre <strong>Espace Locataire</strong>. Depuis cet espace, vous pouvez consulter vos quittances, suivre l'historique de vos paiements et régler votre loyer par Mobile Money.
          </p>
          <div class="credentials">
            <p>Email de connexion : <strong>${email}</strong></p>
            <p>Mot de passe temporaire : <strong>${tempPassword}</strong></p>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Gardez ces informations en lieu sûr.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${loginUrl}" class="btn">Me connecter à mon espace →</a>
          </div>
          <div class="footer">
            <p>© 2026 Lokka Technologies · Gestion locative & encaissement Mobile Money au Bénin</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!brevoApiKey) {
    console.log("ℹ️ [Brevo Simulation] Identifiants envoyés à:", email, "Mot de passe:", tempPassword, "Lien:", loginUrl);
    return { success: true };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: { name: organisationNom, email: "noreply@loka.bj" },
        to: [{ email, name: locataireNom }],
        subject: `[${organisationNom}] Vos accès à votre Espace Locataire`,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.message || "Erreur Brevo API" };
    }

    return { success: true };
  } catch (err) {
    console.error("Erreur sendTenantCredentialsEmail:", err);
    return { success: false, error: "Impossible de joindre le serveur Brevo." };
  }
}
