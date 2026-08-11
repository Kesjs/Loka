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
  Check,
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

  // Critères affichés en temps réel sous le champ mot de passe
  const passwordCriteria = [
    { label: "8 caractères minimum", met: password.length >= 8 },
    { label: "Une majuscule", met: /[A-Z]/.test(password) },
    { label: "Une minuscule", met: /[a-z]/.test(password) },
    { label: "Un chiffre", met: /\d/.test(password) },
    { label: "Un symbole (!@#$...)", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const passwordFocused = password.length > 0;
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const passwordAllValid = passwordCriteria.every((c) => c.met);
  const passwordShowInvalid = passwordBlurred && password.length > 0 && !passwordAllValid;

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
        console.error("Supabase auth error:", authError.code, authError.message);
        setError(mapAuthError(authError.message, authError.code));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/onboarding");
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error("SignUp catch error:", err);
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
            className="h-11 w-full rounded-lg bg-neutral-100 pl-10 pr-4 text-sm transition-colors placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
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
            onBlur={() => setPasswordBlurred(true)}
            disabled={loading || success}
            className={`h-11 w-full rounded-lg pl-10 pr-10 text-sm transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-1 disabled:bg-neutral-100 disabled:text-neutral-500 ${
              passwordAllValid
                ? "bg-success-50 ring-1 ring-success-500"
                : passwordShowInvalid
                ? "bg-danger-50 ring-1 ring-danger-500"
                : "bg-neutral-100 focus:bg-white focus:ring-primary-500"
            }`}
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
        {passwordFocused && (
          <ul className="space-y-1 pt-1">
            {passwordCriteria.map((criterion) => (
              <li
                key={criterion.label}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  criterion.met ? "text-success-600" : "text-neutral-400"
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-colors ${
                    criterion.met ? "bg-success-100" : "bg-neutral-100"
                  }`}
                >
                  {criterion.met && <Check size={9} weight="bold" className="text-success-600" />}
                </span>
                {criterion.label}
              </li>
            ))}
          </ul>
        )}
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
            className="h-11 w-full rounded-lg bg-neutral-100 pl-10 pr-10 text-sm transition-colors placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
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

      {/* Bouton */}
      <Button
        type="submit"
        className="h-11 w-full font-medium"
        disabled={loading || success}
      >
        {loading || success ? (
          <span className="flex items-center justify-center gap-2">
            <CircleNotch size={16} className="animate-spin" />
            Création du compte...
          </span>
        ) : (
          AUTH_MESSAGES.buttons.signUp
        )}
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
