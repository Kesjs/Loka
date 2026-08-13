"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CircleNotch, PaperPlaneRight, CheckCircle, EnvelopeSimple } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TenantPortalCardProps {
  locataireId?: string;
  locataireName: string;
  logementName: string;
  locataireEmail?: string | null;
  isActive?: boolean;
}

export function TenantPortalCard({
  locataireId,
  locataireName,
  logementName,
  locataireEmail,
  isActive = false,
}: TenantPortalCardProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeState, setActiveState] = useState(isActive);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleInvite() {
    if (!locataireId) return;
    if (!locataireEmail) {
      setErrorMsg("Ajoutez un email au locataire avant de l'inviter.");
      return;
    }
    setSending(true);
    setErrorMsg("");

    try {
      // La route API crée le compte du locataire côté serveur (mot de passe
      // temporaire généré, jamais exposé ici) et lui envoie ses identifiants
      // par email avec le lien vers /tenant/login.
      const res = await fetch("/api/tenant/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locataireId,
          locataireNom: locataireName,
          email: locataireEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Une erreur est survenue lors de l'envoi.");
        setSending(false);
        return;
      }

      setSent(true);
    } catch (err) {
      console.error("Erreur d'invitation portail:", err);
      setErrorMsg("Une erreur est survenue lors de l'envoi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <EnvelopeSimple size={18} className="text-primary-600" />
            Espace Locataire
          </CardTitle>
          {activeState ? (
            <div className="flex items-center gap-1.5 rounded-full bg-success-50 border border-success-200 px-2.5 py-1">
              <CheckCircle size={14} className="text-success-600" weight="fill" />
              <span className="text-xs font-semibold text-success-700">Portail Actif</span>
            </div>
          ) : sent ? (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1">
              <PaperPlaneRight size={14} className="text-amber-600" weight="fill" />
              <span className="text-xs font-semibold text-amber-700">Invitation envoyée</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1">
              <span className="text-xs font-medium text-neutral-600">Non activé</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Infos Locataire */}
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 p-3.5 border border-neutral-100">
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Occupant
            </p>
            <p className="font-semibold text-neutral-900 text-sm">{locataireName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Logement
            </p>
            <p className="font-semibold text-neutral-900 text-sm">{logementName}</p>
          </div>
        </div>

        {/* Action Button */}
        {activeState ? (
          <div className="rounded-xl bg-success-50 border border-success-200 p-3 text-center">
            <p className="text-xs font-semibold text-success-700">
              Le locataire a accès à son portail et peut régler ses loyers par Mobile Money.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleInvite}
              disabled={sending || sent}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                sent
                  ? "bg-amber-100 text-amber-800 border border-amber-200 cursor-default"
                  : "bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/20"
              }`}
            >
              {sending ? (
                <>
                  <CircleNotch size={16} className="animate-spin" />
                  Envoi de l'invitation par Brevo...
                </>
              ) : sent ? (
                <>
                  <CheckCircle size={16} weight="fill" />
                  Invitation transmise par Email
                </>
              ) : (
                <>
                  <PaperPlaneRight size={16} weight="bold" />
                  Inviter au Portail Locataire
                </>
              )}
            </motion.button>

            {errorMsg && (
              <p className="text-xs text-danger-600 text-center">{errorMsg}</p>
            )}

            <p className="text-[11px] text-neutral-500 text-center">
              Le locataire recevra ses identifiants de connexion par email pour accéder à ses quittances et payer par Mobile Money.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
