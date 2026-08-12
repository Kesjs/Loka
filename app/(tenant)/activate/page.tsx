"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Buildings, CheckCircle, Lock, CircleNotch, WarningCircle, User } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [locataire, setLocataire] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Jeton d'activation manquant ou invalide.");
      return;
    }

    (async () => {
      try {
        const supabase = createClient();
        const { data, error: fetchErr } = await supabase
          .from("locataires")
          .select("id, nom, email, telephone, activation_token, portal_active")
          .eq("activation_token", token)
          .maybeSingle();

        if (fetchErr || !data) {
          setError("Lien d'activation expiré ou invalide.");
        } else {
          setLocataire(data);
        }
      } catch (err) {
        setError("Erreur lors de la vérification du lien.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      
      // Activer l'espace dans la table locataires
      const { error: updateErr } = await supabase
        .from("locataires")
        .update({ portal_active: true, activation_token: null })
        .eq("id", locataire.id);

      if (updateErr) {
        setError("Impossible d'activer votre espace pour le moment.");
        setSubmitting(false);
        return;
      }

      setActivated(true);
      setTimeout(() => {
        router.push("/tenant/dashboard");
      }, 1500);
    } catch (err) {
      setError("Une erreur est survenue lors de l'activation.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <CircleNotch size={24} className="animate-spin text-emerald-400" />
          <span className="text-sm font-medium">Vérification de votre lien d'activation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 font-sans">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl">
        {/* Header Branding */}
        <div className="flex items-center justify-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            <Buildings size={22} weight="duotone" />
          </div>
          <div className="text-left">
            <span className="block text-base font-black text-white">Lokka</span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Portail Locataire
            </span>
          </div>
        </div>

        {activated ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle size={48} className="mx-auto text-emerald-400" weight="fill" />
            <h2 className="text-lg font-bold text-white">Espace Locataire Activé !</h2>
            <p className="text-xs text-slate-400">
              Redirection vers votre tableau de bord locataire...
            </p>
          </div>
        ) : error && !locataire ? (
          <div className="py-8 text-center space-y-4">
            <WarningCircle size={48} className="mx-auto text-rose-400" weight="fill" />
            <h2 className="text-base font-bold text-white">Lien invalide</h2>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        ) : (
          <form onSubmit={handleActivate} className="space-y-4 text-xs">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Créer votre mot de passe</h2>
              <p className="text-slate-400">
                Bienvenue <strong className="text-white">{locataire?.nom}</strong>. Finalisez la création de votre compte locataire.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-rose-400">
                <WarningCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Votre nom</label>
              <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 text-slate-400">
                <User size={16} />
                <span className="text-white">{locataire?.nom}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="******"
                  className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <CircleNotch size={16} className="animate-spin" />
                  Activation en cours...
                </>
              ) : (
                <>
                  <CheckCircle size={16} weight="bold" />
                  Activer mon espace et accéder au tableau de bord
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function TenantActivatePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <CircleNotch size={24} className="animate-spin text-emerald-400" />
      </div>
    }>
      <ActivateContent />
    </Suspense>
  );
}
