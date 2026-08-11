"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeSlash,
  EnvelopeSimple,
  Lock,
  CircleNotch,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, AUTH_MESSAGES } from "@/lib/auth-messages";
import { useToast } from "@/context/ToastContext";

interface SignInFormProps {
  onForgotPassword: () => void;
}

export default function SignInFormMinimal({ onForgotPassword }: SignInFormProps) {
  const router = useRouter();
  const { showToast, removeToast } = useToast();
  const errorToastId = useRef<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function clearErrorToast() {
    if (errorToastId.current) {
      removeToast(errorToastId.current);
      errorToastId.current = null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      errorToastId.current = showToast(
        !email && !password
          ? AUTH_MESSAGES.validation.allFieldsRequired
          : !email
          ? AUTH_MESSAGES.validation.emailRequired
          : AUTH_MESSAGES.validation.passwordRequired,
        "error"
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorToastId.current = showToast(AUTH_MESSAGES.validation.emailInvalid, "error");
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
        console.error("Supabase auth error:", authError);
        errorToastId.current = showToast(mapAuthError(authError.message), "error");
        setLoading(false);
        return;
      }

      router.push("/dashboard/home");
      router.refresh();
    } catch (err) {
      console.error("SignIn catch error:", err);
      errorToastId.current = showToast(AUTH_MESSAGES.errors.networkError, "error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="signin-email" className="text-sm font-light text-neutral-700">
          {AUTH_MESSAGES.labels.email}
        </label>
        <div className="relative group">
          <EnvelopeSimple
            size={18}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
          />
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearErrorToast();
            }}
            disabled={loading}
            className="w-full pl-7 pr-0 py-2 text-sm bg-transparent border-0 border-b border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-0 transition-colors placeholder:text-neutral-400 disabled:text-neutral-500 font-light"
            placeholder={AUTH_MESSAGES.placeholders.email}
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div className="space-y-2">
        <label htmlFor="signin-password" className="text-sm font-light text-neutral-700">
          {AUTH_MESSAGES.labels.password}
        </label>
        <div className="relative group">
          <Lock
            size={18}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
          />
          <input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearErrorToast();
            }}
            disabled={loading}
            className="w-full pl-7 pr-8 py-2 text-sm bg-transparent border-0 border-b border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-0 transition-colors placeholder:text-neutral-400 disabled:text-neutral-500 font-light"
            placeholder={AUTH_MESSAGES.placeholders.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={loading}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600 disabled:opacity-50"
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
          className="text-xs font-light text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-50 underline decoration-neutral-300 underline-offset-2"
        >
          {AUTH_MESSAGES.hints.forgotPasswordQuestion}
        </button>
      </div>

      {/* Bouton */}
      <Button
        type="submit"
        className="h-11 w-full font-light bg-primary-800 hover:bg-primary-900 text-white rounded-full"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <CircleNotch size={16} className="animate-spin" />
            Connexion...
          </span>
        ) : (
          AUTH_MESSAGES.buttons.signIn
        )}
      </Button>
    </form>
  );
}
