"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeSlash,
  EnvelopeSimple,
  Lock,
  CheckCircle,
  CircleNotch,
  Check,
  WarningCircle,
  User,
  Phone,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, AUTH_MESSAGES } from "@/lib/auth-messages";

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export default function SignUpFormMinimal({ onSwitchToSignIn }: SignUpFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Email validation state
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);

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

  // Password validation criteria
  const passwordCriteria = [
    { label: "8 caractères minimum", met: password.length >= 8 },
    { label: "Une majuscule", met: /[A-Z]/.test(password) },
    { label: "Une minuscule", met: /[a-z]/.test(password) },
    { label: "Un chiffre", met: /\d/.test(password) },
    { label: "Un symbole (!@#$...)", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const passwordFocused = password.length > 0;
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const passwordAllValid = passwordCriteria.every((c: { met: boolean }) => c.met);
  const passwordShowInvalid = passwordBlurred && password.length > 0 && !passwordAllValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !password || !confirmPassword || !fullName || !phone) {
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
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (authError) {
        setError(mapAuthError(authError.message, authError.code));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/onboarding");
        router.refresh();
      }, 2000);
    } catch {
      setError(AUTH_MESSAGES.errors.networkError);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-danger-600 font-light bg-danger-50 px-3 py-1.5 rounded-lg">
          <WarningCircle size={14} />
          {error}
        </div>
      )}

      {/* Succès */}
      {success && (
        <div className="flex items-center gap-2 text-sm text-neutral-700 font-light">
          <CheckCircle size={16} className="text-neutral-900" weight="fill" />
          <span>Compte créé — redirection en cours…</span>
        </div>
      )}

      {/* Nom et Téléphone - Layout horizontal */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="signup-name" className="text-sm font-light text-neutral-700">
            Nom complet
          </label>
          <div className="relative group">
            <User
              size={18}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
            />
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading || success}
              className="w-full pl-7 pr-0 py-2 text-sm bg-transparent border-0 border-b border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-0 transition-colors placeholder:text-neutral-400 disabled:text-neutral-500 font-light"
              placeholder="Marie Dossou"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-phone" className="text-sm font-light text-neutral-700">
            Téléphone
          </label>
          <div className="relative group">
            <Phone
              size={18}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
            />
            <input
              id="signup-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading || success}
              className="w-full pl-7 pr-0 py-2 text-sm bg-transparent border-0 border-b border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-0 transition-colors placeholder:text-neutral-400 disabled:text-neutral-500 font-light"
              placeholder="+229 97 00 00 00"
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="signup-email" className="text-sm font-light text-neutral-700">
          {AUTH_MESSAGES.labels.email}
        </label>
        <div className="relative group">
          <EnvelopeSimple
            size={18}
            className={`absolute left-0 top-1/2 -translate-y-1/2 transition-colors ${
              emailValid === true ? "text-success-600" : emailValid === false ? "text-danger-600" : "text-neutral-400 group-focus-within:text-neutral-900"
            }`}
          />
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value.length > 0) {
                setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value));
              } else {
                setEmailValid(null);
              }
            }}
            disabled={loading || success}
            className={`w-full pl-7 pr-0 py-2 text-sm bg-transparent border-0 border-b focus:outline-none focus:ring-0 transition-colors placeholder:text-neutral-400 disabled:text-neutral-500 font-light ${
              emailValid === true ? "border-success-500" : emailValid === false ? "border-danger-500" : "border-neutral-300 focus:border-neutral-900"
            }`}
            placeholder={AUTH_MESSAGES.placeholders.email}
          />
          {emailValid === true && (
            <CheckCircle size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-success-600" weight="fill" />
          )}
        </div>
      </div>

      {/* Mot de passe */}
      <div className="space-y-2">
        <label htmlFor="signup-password" className="text-sm font-light text-neutral-700">
          {AUTH_MESSAGES.labels.password}
        </label>
        <div className="relative group">
          <Lock
            size={18}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
          />
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordBlurred(true)}
            disabled={loading || success}
            className={`w-full pl-7 pr-8 py-2 text-sm bg-transparent border-0 border-b focus:outline-none focus:ring-0 transition-colors placeholder:text-neutral-400 disabled:text-neutral-500 font-light ${
              passwordAllValid
                ? "border-neutral-900"
                : passwordShowInvalid
                ? "border-red-400"
                : "border-neutral-300 focus:border-neutral-900"
            }`}
            placeholder={AUTH_MESSAGES.placeholders.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={loading}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600 disabled:opacity-50"
            tabIndex={-1}
          >
            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {passwordFocused && (
          <div className="pt-1">
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                passwordAllValid ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
              }`}
            >
              <ul className="space-y-1 overflow-hidden">
                {passwordCriteria.map((criterion, index) => (
                  <motion.li
                    key={criterion.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className={`flex items-center gap-1.5 text-[11px] transition-colors font-light ${
                      criterion.met ? "text-success-600" : "text-neutral-400"
                    }`}
                  >
                    <span
                      className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                        criterion.met ? "bg-success-100 scale-110" : "bg-neutral-100"
                      }`}
                    >
                      {criterion.met && <Check size={8} weight="bold" className="text-success-600" />}
                    </span>
                    {criterion.label}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                passwordAllValid ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <motion.div
                  className={`flex items-center gap-2 text-[11px] font-light text-success-600 transition-all duration-300 ease-out ${
                    passwordAllValid ? "scale-100 opacity-100 delay-100" : "scale-90 opacity-0 delay-0"
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: passwordAllValid ? 1 : 0, y: passwordAllValid ? 0 : -10 }}
                >
                  <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-success-100">
                    <Check size={8} weight="bold" className="text-success-600" />
                  </span>
                  Mot de passe sécurisé
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmer mot de passe */}
      <div className="space-y-2">
        <label htmlFor="signup-confirm" className="text-sm font-light text-neutral-700">
          {AUTH_MESSAGES.labels.confirmPassword}
        </label>
        <div className="relative group">
          <Lock
            size={18}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors"
          />
          <input
            id="signup-confirm"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || success}
            className="w-full pl-7 pr-8 py-2 text-sm bg-transparent border-0 border-b border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-0 transition-colors placeholder:text-neutral-400 disabled:text-neutral-500 font-light"
            placeholder={AUTH_MESSAGES.placeholders.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            disabled={loading}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600 disabled:opacity-50"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Bouton */}
      <Button
        type="submit"
        className="h-11 w-full font-light bg-primary-800 hover:bg-primary-900 text-white rounded-full"
        disabled={loading || success}
      >
        {loading || success ? (
          <span className="flex items-center justify-center gap-2">
            <CircleNotch size={16} className="animate-spin" />
            Création...
          </span>
        ) : (
          AUTH_MESSAGES.buttons.signUp
        )}
      </Button>
    </form>
  );
}
