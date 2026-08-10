"use client";

import { useState } from "react";
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

export default function TenantDashboardPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mtn" | "moov" | "card">("mtn");
  const [phone, setPhone] = useState("01 97 00 00 00");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [issueSubmitted, setIssueSubmitted] = useState(false);
  const [issueText, setIssueText] = useState("");

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
    }, 2500);
  }

  function handleSendIssue(e: React.FormEvent) {
    e.preventDefault();
    setIssueSubmitted(true);
    setIssueText("");
  }

  return (
    <div className="space-y-8">
      {/* Salutation & Infos Résidence */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Espace Occupant
          </span>
          <h1 className="text-2xl font-black text-white sm:text-3xl">Bienvenue dans votre espace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Résidence Fidjrossè · Appartement A2 (2ème étage) · Cotonou
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">Contrat Actif (Bail de 12 mois)</span>
        </div>
      </div>

      {/* CARTE STATUT DU MOIS (LOYER DÛ) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {paymentSuccess ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                  <CheckCircle size={14} weight="fill" /> Loyers réglé pour Juin 2026
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400">
                  <Clock size={14} weight="fill" /> Loyer en attente de règlement
                </span>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Montant du loyer mensuel</p>
              <p className="text-3xl font-black text-white">150 000 FCFA</p>
            </div>

            <p className="text-xs text-slate-400">
              Échéance : <span className="text-white font-semibold">05 Juin 2026</span> · Charges comprises
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            {paymentSuccess ? (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/quittances/download", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ locataireId: "current" }),
                    });
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "quittance.pdf";
                      a.click();
                    } else {
                      alert("Erreur lors du téléchargement. Contactez le support.");
                    }
                  } catch (error) {
                    alert("Erreur de connexion. Vérifiez votre connexion internet.");
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
              >
                <DownloadSimple size={16} weight="bold" />
                Télécharger la Quittance PDF
              </button>
            ) : (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-all"
              >
                <DeviceMobile size={18} weight="bold" />
                Payer par Mobile Money (GeniusPay)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GRILLE 2 COLONNES : QUITTANCES + SIGNALEMENT */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* COLONNE 1 & 2 : HISTORIQUE QUITTANCES */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" />
              Mes Quittances & Reçus Officiels
            </h3>
            <span className="text-xs text-slate-400">3 quittances disponibles</span>
          </div>

          <div className="space-y-3">
            {[
              { mois: "Mai 2026", montant: "150 000 FCFA", mode: "MTN MoMo", date: "03/05/2026", ref: "REC-2026-05-A2" },
              { mois: "Avril 2026", montant: "150 000 FCFA", mode: "Moov Money", date: "02/04/2026", ref: "REC-2026-04-A2" },
              { mois: "Mars 2026", montant: "150 000 FCFA", mode: "Espèces", date: "05/03/2026", ref: "REC-2026-03-A2" },
            ].map((q, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs transition-all hover:border-slate-700"
              >
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm">{q.mois}</p>
                  <p className="text-slate-400 text-[11px]">
                    Réf : {q.ref} · Réglé le {q.date} via {q.mode}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{q.montant}</span>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/quittances/download/${q.ref}`, {
                          method: "GET",
                        });
                        if (response.ok) {
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `quittance-${q.ref}.pdf`;
                          a.click();
                        } else {
                          alert("Erreur lors du téléchargement.");
                        }
                      } catch (error) {
                        alert("Erreur de connexion.");
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    title="Télécharger la quittance PDF"
                  >
                    <DownloadSimple size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNE 3 : SIGNALEMENT INCIDENT */}
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
                  Votre gestionnaire a été notifié et reviendra vers vous rapidement.
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

      {/* MODAL DE PAIEMENT GENIUSPAY */}
      {showPaymentModal && (
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
                Paiement Sécurisé GeniusPay
              </span>
              <h3 className="text-lg font-black text-white">Règlement du loyer · Juin 2026</h3>
              <p className="text-xs text-slate-400">Montant à débiter : <strong className="text-white">150 000 FCFA</strong></p>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle size={48} className="mx-auto text-emerald-400" weight="fill" />
                <h4 className="text-base font-bold text-white">Paiement validé avec succès !</h4>
                <p className="text-xs text-slate-400">
                  Votre loyer est réglé. Votre quittance a été générée automatiquement.
                </p>
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
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <CircleNotch size={16} className="animate-spin" />
                      Validation de la transaction MoMo...
                    </>
                  ) : (
                    <>
                      <CurrencyCircleDollar size={18} />
                      Valider le règlement de 150 000 FCFA
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-500 text-center">
                  Transaction chiffrée et sécurisée par GeniusPay.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
