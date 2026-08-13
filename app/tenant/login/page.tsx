"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Buildings, CheckCircle, Lock, CircleNotch, WarningCircle, EnvelopeSimple } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import BackToHomeLink from "@/components/auth/BackToHomeLink";

/**
 * Page de connexion du Portail Locataire (/tenant/login).
 *
 * Aucune inscription libre ici : un locataire ne peut se connecter que si
 * son propriétaire lui a envoyé ses identifiants (email généré par lui +
 * mot de passe temporaire, voir /api/tenant/invite et lib/brevo.ts). Le
 * message ci-dessous le rappelle clairement.
 */
export default function TenantLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        setError("Email ou mot de passe incorrect.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/tenant/dashboard");
        router.refresh();
      }, 800);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 font-sans">
      <div className="w-full max-w-md space-y-4">
        {/* Retour à l'accueil — même animation que les pages /login et /auth, variante sombre */}
        <BackToHomeLink variant="dark" className="mb-0 px-1" />

        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl">
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

          {success ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle size={48} className="mx-auto text-emerald-400" weight="fill" />
              <h2 className="text-lg font-bold text-white">Connexion réussie</h2>
              <p className="text-xs text-slate-400">Redirection vers votre espace...</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">Accéder à mon espace</h2>
                <p className="text-slate-400">
                  Vos identifiants vous ont été envoyés par email par votre propriétaire ou gestionnaire — c&apos;est lui qui vous donne accès au portail.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-rose-400">
                  <WarningCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Email</label>
                <div className="relative">
                  <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.bj"
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Mot de passe</label>
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <CircleNotch size={16} className="animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                Pas encore de compte ? Demandez à votre propriétaire de vous inviter depuis son tableau de bord Lokka.
              </p>
            </form>
          )}
          </div>
      </div>
    </div>
  );
}
