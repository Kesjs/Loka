/**
 * lib/brevo.ts
 * 
 * Helper pour l'envoi d'emails transactionnels d'invitation au Portail Locataire via Brevo API.
 */

interface SendTenantInvitationParams {
  email: string;
  locataireNom: string;
  organisationNom: string;
  activationToken: string;
  logoUrl?: string | null;
}

export async function sendTenantInvitationEmail({
  email,
  locataireNom,
  organisationNom,
  activationToken,
  logoUrl,
}: SendTenantInvitationParams): Promise<{ success: boolean; error?: string }> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://loka.bj";
  const activationUrl = `${baseUrl}/tenant/activate?token=${activationToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; }
          .header { text-align: center; margin-bottom: 24px; }
          .btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; margin-top: 20px; }
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
            Votre gestionnaire <strong>${organisationNom}</strong> vous a ouvert l'accès à votre <strong>Portail Locataire Lokka</strong>.
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Depuis cet espace sécurisé, vous pourrez consulter vos quittances de loyer, suivre votre historique et régler vos échéances directement par MTN Mobile Money, Moov Money ou carte bancaire.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${activationUrl}" class="btn">Activer mon Espace Locataire →</a>
          </div>
          <div class="footer">
            <p>© 2026 Lokka Technologies · Gestion locative & encaissement Mobile Money au Bénin</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!brevoApiKey) {
    console.log("ℹ️ [Brevo Simulation] Email invitation généré pour:", email, "Lien:", activationUrl);
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
        subject: `[${organisationNom}] Activation de votre Espace Locataire`,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.message || "Erreur Brevo API" };
    }

    return { success: true };
  } catch (err) {
    console.error("Erreur sendTenantInvitationEmail:", err);
    return { success: false, error: "Impossible de joindre le serveur Brevo." };
  }
}
