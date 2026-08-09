"use client";

import { useState } from "react";
import {
  WarningCircle,
  EnvelopeSimple,
  CheckCircle,
  ArrowLeft,
  Info,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, AUTH_MESSAGES } from "@/lib/auth-messages";

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export default function ForgotPasswordForm({ onBackToSignIn }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!email) {
      setError(AUTH_MESSAGES.validation.emailRequired);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(AUTH_MESSAGES.validation.emailInvalid);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (resetError) {
        setError(mapAuthError(resetError.message));
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(AUTH_MESSAGES.errors.networkError);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-lg border border-success-100 bg-success-50 px-4 py-3 text-sm text-success-600 animate-[slideDown_0.3s_ease-out]">
          <CheckCircle size={18} className="mt-0.5 shrink-0" weight="fill" />
          <div>
            <p className="font-medium">{AUTH_MESSAGES.success.resetLinkSent}</p>
            <p className="text-xs mt-1">{AUTH_MESSAGES.success.checkYourEmail}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <p className="text-sm text-neutral-600">
            Vérifiez votre boîte aux lettres et cliquez sur le lien de réinitialisation.
          </p>
          <p className="text-xs text-neutral-500">
            Vous n'avez pas reçu l'email ? Vérifiez votre dossier de spam ou réessayez.
          </p>
        </div>

        <Button
          onClick={onBackToSignIn}
          variant="outline"
          className="h-11 w-full"
        >
          <ArrowLeft size={16} className="mr-2" />
          Retour à la connexion
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600 animate-[slideDown_0.3s_ease-out]">
          <WarningCircle size={18} className="mt-0.5 shrink-0" weight="fill" />
          <span>{error}</span>
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 rounded-lg bg-neutral-100 px-3 py-2.5">
        <Info size={16} className="text-neutral-600 mt-0.5 shrink-0" weight="fill" />
        <p className="text-xs text-neutral-700">
          Entrez votre adresse email associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="forgot-email" className="text-sm font-medium text-neutral-700">
          {AUTH_MESSAGES.labels.email}
        </label>
        <div className="relative">
          <EnvelopeSimple
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-11 w-full rounded-lg border border-neutral-300 pl-10 pr-4 text-sm transition-all placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
            placeholder={AUTH_MESSAGES.placeholders.email}
          />
        </div>
      </div>

      {/* Bouton */}
      <Button
        type="submit"
        className="h-11 w-full font-medium"
        disabled={loading}
      >
        {loading
          ? AUTH_MESSAGES.buttons.sending
          : AUTH_MESSAGES.buttons.forgotPassword}
      </Button>

      {/* Bouton retour */}
      <Button
        type="button"
        onClick={onBackToSignIn}
        variant="outline"
        className="h-11 w-full"
        disabled={loading}
      >
        <ArrowLeft size={16} className="mr-2" />
        Retour à la connexion
      </Button>
    </form>
  );
}
