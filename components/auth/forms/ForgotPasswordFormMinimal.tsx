"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  EnvelopeSimple,
  CircleNotch,
  CheckCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, AUTH_MESSAGES } from "@/lib/auth-messages";
import { useToast } from "@/context/ToastContext";

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export default function ForgotPasswordFormMinimal({ onBackToSignIn }: ForgotPasswordFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);

    if (!email) {
      showToast(AUTH_MESSAGES.validation.emailRequired, "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(AUTH_MESSAGES.validation.emailInvalid, "error");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (authError) {
        showToast(mapAuthError(authError.message), "error");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      showToast(AUTH_MESSAGES.errors.networkError, "error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Succès */}
      {success && (
        <div className="flex items-center gap-2 text-sm text-neutral-700 font-light">
          <CheckCircle size={16} className="text-neutral-900" weight="fill" />
          <span>Email de réinitialisation envoyé</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="forgot-email" className="text-sm font-light text-neutral-700">
          {AUTH_MESSAGES.labels.email}
        </label>
        <div className="relative group">
          <EnvelopeSimple
            size={18}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
          />
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
            className="w-full pl-7 pr-0 py-2 text-sm bg-transparent border-0 border-b border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-0 transition-colors placeholder:text-neutral-400 disabled:text-neutral-500 font-light"
            placeholder={AUTH_MESSAGES.placeholders.email}
          />
        </div>
      </div>

      {/* Bouton */}
      <Button
        type="submit"
        className="h-11 w-full font-light bg-neutral-900 hover:bg-neutral-800 text-white rounded-full"
        disabled={loading || success}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <CircleNotch size={16} className="animate-spin" />
            Envoi...
          </span>
        ) : (
          "Envoyer le lien"
        )}
      </Button>

      {/* Retour */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToSignIn}
          disabled={loading}
          className="text-sm font-light text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-50 underline decoration-neutral-300 underline-offset-2"
        >
          Retour à la connexion
        </button>
      </div>
    </form>
  );
}
