"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeSlash,
  WarningCircle,
  EnvelopeSimple,
  Lock,
  CircleNotch,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, AUTH_MESSAGES } from "@/lib/auth-messages";

interface SignInFormProps {
  onForgotPassword: () => void;
}

export default function SignInForm({ onForgotPassword }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password) {
      setError(
        !email && !password
          ? AUTH_MESSAGES.validation.allFieldsRequired
          : !email
          ? AUTH_MESSAGES.validation.emailRequired
          : AUTH_MESSAGES.validation.passwordRequired
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(AUTH_MESSAGES.validation.emailInvalid);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(mapAuthError(authError.message));
        setLoading(false);
        return;
      }

      router.push("/home");
      router.refresh();
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



      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="signin-email" className="text-sm font-medium text-neutral-700">
          {AUTH_MESSAGES.labels.email}
        </label>
        <div className="relative">
          <EnvelopeSimple
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            id="signin-email"
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

      {/* Mot de passe */}
      <div className="space-y-2">
        <label htmlFor="signin-password" className="text-sm font-medium text-neutral-700">
          {AUTH_MESSAGES.labels.password}
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="h-11 w-full rounded-lg border border-neutral-300 pl-10 pr-10 text-sm transition-all placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500"
            placeholder={AUTH_MESSAGES.placeholders.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600 disabled:opacity-50"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            tabIndex={-1}
          >
            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Mot de passe oublié */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={loading}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
        >
          {AUTH_MESSAGES.hints.forgotPasswordQuestion}
        </button>
      </div>

      {/* Bouton */}
      <Button
        type="submit"
        className="h-11 w-full font-medium"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <CircleNotch size={16} className="animate-spin" />
            Connexion en cours...
          </span>
        ) : (
          AUTH_MESSAGES.buttons.signIn
        )}
      </Button>
    </form>
  );
}
