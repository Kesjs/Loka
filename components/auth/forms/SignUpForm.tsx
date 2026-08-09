"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeSlash,
  WarningCircle,
  EnvelopeSimple,
  Lock,
  CheckCircle,
  CircleNotch,
  Info,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, AUTH_MESSAGES } from "@/lib/auth-messages";

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export default function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validation du mot de passe
  function validatePassword(pwd: string): { valid: boolean; message?: string } {
    if (pwd.length < 8) {
      return { valid: false, message: AUTH_MESSAGES.validation.passwordTooShort };
    }
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return { valid: false, message: AUTH_MESSAGES.validation.passwordWeak };
    }
    return { valid: true };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError(AUTH_MESSAGES.validation.allFieldsRequired);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(AUTH_MESSAGES.validation.emailInvalid);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || AUTH_MESSAGES.validation.passwordWeak);
      return;
    }

    if (password !== confirmPassword) {
      setError(AUTH_MESSAGES.validation.passwordMismatch);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(mapAuthError(authError.message));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/onboarding");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(AUTH_MESSAGES.errors.networkError);
      setLoading(false);
    }
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

      {/* Succès */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-success-50 px-4 py-3.5 text-sm text-success-700 animate-[slideDown_0.3s_ease-out]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-100">
            <CheckCircle size={16} className="text-success-600" weight="fill" />
          </span>
          <span className="font-medium">Compte créé — redirection en cours…</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="signup-email" className="text-sm font-medium text-neutral-700">
          {AUTH_MESSAGES.labels.email}
        </label>
        <div className="relative">
          <EnvelopeSimple
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
            className="h-11 w-full rounded-lg border border-neutral-300 pl-10 pr-4 text-sm transition-all placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
            placeholder={AUTH_MESSAGES.placeholders.email}
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div className="space-y-2">
        <label htmlFor="signup-password" className="text-sm font-medium text-neutral-700">
          {AUTH_MESSAGES.labels.password}
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || success}
            className="h-11 w-full rounded-lg border border-neutral-300 pl-10 pr-10 text-sm transition-all placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
            placeholder={AUTH_MESSAGES.placeholders.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600 disabled:opacity-50"
            tabIndex={-1}
          >
            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          {AUTH_MESSAGES.hints.passwordRequirements}
        </p>
      </div>

      {/* Confirmer mot de passe */}
      <div className="space-y-2">
        <label htmlFor="signup-confirm" className="text-sm font-medium text-neutral-700">
          {AUTH_MESSAGES.labels.confirmPassword}
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            id="signup-confirm"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || success}
            className="h-11 w-full rounded-lg border border-neutral-300 pl-10 pr-10 text-sm transition-all placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
            placeholder={AUTH_MESSAGES.placeholders.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600 disabled:opacity-50"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Note de sécurité */}
      <div className="flex items-start gap-2 rounded-lg bg-primary-50 px-3 py-2.5">
        <Info size={16} className="text-primary-600 mt-0.5 shrink-0" weight="fill" />
        <p className="text-xs text-primary-700">{AUTH_MESSAGES.hints.securityNote}</p>
      </div>

      {/* Bouton */}
      <Button
        type="submit"
        className="h-11 w-full font-medium"
        disabled={loading || success}
      >
        {loading && (
          <span className="flex items-center justify-center gap-2">
            <CircleNotch size={16} className="animate-spin" />
            Veuillez patienter
          </span>
        )}
        {success && (
          <span className="flex items-center justify-center gap-2">
            <CircleNotch size={16} className="animate-spin" />
            Redirection
          </span>
        )}
        {!loading && !success && AUTH_MESSAGES.buttons.signUp}
      </Button>

      {/* Lien connexion */}
      <div className="text-center text-sm text-neutral-600">
        {AUTH_MESSAGES.hints.haveAccount}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          disabled={loading || success}
          className="ml-1 font-medium text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
        >
          {AUTH_MESSAGES.hints.switchToSignIn}
        </button>
      </div>
    </form>
  );
}
