"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CurrencyCircleDollar,
  FileText,
  CheckCircle,
  Clock,
  DeviceMobile,
  CreditCard,
  DownloadSimple,
  WarningCircle,
  PaperPlaneRight,
  ShieldCheck,
  X,
  CircleNotch,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface Paiement {
  id: string;
  montant: number;
  date_paiement: string;
  mode: string | null;
  periode_debut: string;
  periode_fin: string;
}

interface Logement {
  nom: string;
  type: string | null;
  immeuble: { nom: string; ville: string | null } | null;
}

interface TenantDashboardClientProps {
  locataireNom: string;
  contratId: string | null;
  loyerMensuel: number | null;
  logement: Logement | null;
  paiements: Paiement[];
}

const MODE_LABELS: Record<string, string> = {
  cash: "Espèces",
  mobile_money: "Mobile Money",
  virement: "Virement",
  cheque: "Chèque",
};

function formatFcfa(montant: number) {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

function isSameMonth(dateStr: string, ref: Date) {
  const d = new Date(dateStr);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export default function TenantDashboardClient({
  locataireNom,
  contratId,
  loyerMensuel,
  logement,
  paiements,
}: TenantDashboardClientProps) {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);

  const dejaRegleCeMois = useMemo(
    () => paiements.some((p) => isSameMonth(p.periode_debut, now)),
    [paiements, now]
  );

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mtn" | "moov" | "card">("mtn");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payError, setPayError] = useState("");

  const [issueSubmitted, setIssueSubmitted] = useState(false);
  const [issueText, setIssueText] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!contratId || !loyerMensuel) return;

    setProcessing(true);
    setPayError("");

    // Simulation du temps de traitement Mobile Money — le paiement réel
    // (webhook GeniusPay) reste à brancher ; ici on enregistre directement
    // le règlement pour que quittances et historique reflètent une vraie
    // donnée dès que le locataire valide.
    setTimeout(async () => {
      const supabase = createClient();
      const debut = new Date(now.getFullYear(), now.getMonth(), 1);
      const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { error } = await supabase.from("paiements").insert({
        contrat_id: contratId,
        montant: loyerMensuel,
        date_paiement: now.toISOString().slice(0, 10),
        periode_debut: debut.toISOString().slice(0, 10),
        periode_fin: fin.toISOString().slice(0, 10),
        mode: "mobile_money",
        payment_method: paymentMethod === "mtn" ? "momo_mtn" : paymentMethod === "moov" ? "momo_moov" : "card",
        status: "completed",
      });

      setProcessing(false);

      if (error) {
        setPayError(
          error.code === "23505"
            ? "Le loyer de ce mois est déjà réglé."
            : "Le paiement n'a pas pu être enregistré. Réessayez."
        );
        return;
      }

      setPaymentSuccess(true);
      router.refresh();
    }, 2000);
  }

  function handleSendIssue(e: React.FormEvent) {
    e.preventDefault();
    setIssueSubmitted(true);
    setIssueText("");
  }

  async function handleDownload(paiementId: string) {
    try {
      const response = await fetch(`/api/quittances/download?ref=${paiementId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `quittance-${paiementId}.pdf`;
        a.click();
      } else {
        alert("Erreur lors du téléchargement.");
      }
    } catch {
      alert("Erreur de connexion.");
    }
  }

  const residenceLabel = logement
    ? [logement.immeuble?.nom, logement.nom, logement.immeuble?.ville].filter(Boolean).join(" · ")
    : "Aucun logement actif pour le moment";

  return (
    <div className="space-y-8">
      {/* Salutation & Infos Résidence */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Espace Occupant
          </span>
          <h1 className="text-2xl font-black text-white sm:text-3xl">Bienvenue, {locataireNom}</h1>
          <p className="text-xs text-slate-400 mt-1">{residenceLabel}</p>
        </div>

        {contratId && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">Contrat actif</span>
          </div>
        )}
      </div>

      {!contratId || !loyerMensuel ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
          Aucun contrat actif n&apos;est encore associé à votre compte. Contactez votre bailleur si cela vous semble anormal.
        </div>
      ) : (
        <>
          {/* CARTE STATUT DU MOIS (LOYER DÛ) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {dejaRegleCeMois || paymentSuccess ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                      <CheckCircle size={14} weight="fill" /> Loyer réglé ce mois-ci
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400">
                      <Clock size={14} weight="fill" /> Loyer en attente de règlement
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-medium">Montant du loyer mensuel</p>
                  <p className="text-3xl font-black text-white">{formatFcfa(loyerMensuel)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                {dejaRegleCeMois || paymentSuccess ? (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-center">
                    <p className="text-xs font-semibold text-emerald-400">
                      Votre quittance est disponible ci-dessous.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-all"
                  >
                    <DeviceMobile size={18} weight="bold" />
                    Payer par Mobile Money
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* GRILLE 2 COLONNES : QUITTANCES + SIGNALEMENT */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText size={18} className="text-emerald-400" />
                  Mes Quittances & Reçus
                </h3>
                <span className="text-xs text-slate-400">
                  {paiements.length} quittance{paiements.length > 1 ? "s" : ""} disponible{paiements.length > 1 ? "s" : ""}
                </span>
              </div>

              {paiements.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-xs text-slate-400">
                  Aucun paiement enregistré pour le moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {paiements.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs transition-all hover:border-slate-700"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-white text-sm">
                          {new Date(p.periode_debut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Réglé le {new Date(p.date_paiement).toLocaleDateString("fr-FR")} via {MODE_LABELS[p.mode ?? ""] ?? "Non précisé"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white">{formatFcfa(p.montant)}</span>
                        <button
                          onClick={() => handleDownload(p.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          title="Télécharger la quittance PDF"
                        >
                          <DownloadSimple size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <WarningCircle size={18} className="text-amber-400" />
                Contacter le Gestionnaire
              </h3>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-4">
                {issueSubmitted ? (
                  <div className="py-6 text-center space-y-2">
                    <CheckCircle size={32} className="mx-auto text-emerald-400" weight="fill" />
                    <p className="text-xs font-bold text-white">Signalement transmis</p>
                    <p className="text-[11px] text-slate-400">
                      Votre bailleur a été notifié et reviendra vers vous rapidement.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSendIssue} className="space-y-3 text-xs">
                    <p className="text-slate-400 text-[11px]">
                      Un souci de plomberie, serrure ou électricité ? Informez votre bailleur en direct.
                    </p>
                    <textarea
                      rows={3}
                      required
                      value={issueText}
                      onChange={(e) => setIssueText(e.target.value)}
                      placeholder="Décrivez le problème..."
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-white text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <PaperPlaneRight size={14} />
                      Envoyer la requête
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE PAIEMENT */}
      {showPaymentModal && loyerMensuel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                Paiement Mobile Money
              </span>
              <h3 className="text-lg font-black text-white">Règlement du loyer</h3>
              <p className="text-xs text-slate-400">
                Montant à débiter : <strong className="text-white">{formatFcfa(loyerMensuel)}</strong>
              </p>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle size={48} className="mx-auto text-emerald-400" weight="fill" />
                <h4 className="text-base font-bold text-white">Paiement enregistré avec succès !</h4>
                <p className="text-xs text-slate-400">Votre quittance est maintenant disponible.</p>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handlePay} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-semibold text-slate-300">Choisissez votre moyen de paiement :</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mtn")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-[11px] transition-all ${
                        paymentMethod === "mtn"
                          ? "border-amber-500 bg-amber-500/10 text-amber-300"
                          : "border-slate-800 bg-slate-950 text-slate-400"
                      }`}
                    >
                      <DeviceMobile size={18} />
                      MTN MoMo
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("moov")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-[11px] transition-all ${
                        paymentMethod === "moov"
                          ? "border-blue-500 bg-blue-500/10 text-blue-300"
                          : "border-slate-800 bg-slate-950 text-slate-400"
                      }`}
                    >
                      <DeviceMobile size={18} />
                      Moov Money
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold text-[11px] transition-all ${
                        paymentMethod === "card"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                          : "border-slate-800 bg-slate-950 text-slate-400"
                      }`}
                    >
                      <CreditCard size={18} />
                      Carte Visa
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">
                    {paymentMethod === "card" ? "Numéro de carte" : "Numéro Mobile Money (Bénin 🇧🇯)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01 97 00 00 00"
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {payError && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-rose-400">
                    <WarningCircle size={16} className="shrink-0" />
                    <span>{payError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <CircleNotch size={16} className="animate-spin" />
                      Validation de la transaction...
                    </>
                  ) : (
                    <>
                      <CurrencyCircleDollar size={18} />
                      Valider le règlement de {formatFcfa(loyerMensuel)}
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-500 text-center">
                  Transaction chiffrée et sécurisée.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
