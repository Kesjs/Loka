"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeSlash, WarningCircle, EnvelopeSimple, Lock } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError } from "@/lib/auth-errors";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(
        !email && !password
          ? "Veuillez renseigner votre email et votre mot de passe."
          : !email
          ? "Veuillez renseigner votre email."
          : "Veuillez renseigner votre mot de passe."
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message
          ? mapAuthError(authError.message)
          : "Impossible de se connecter pour le moment. Vérifiez vos identifiants et réessayez."
      );
      setLoading(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Left Side: Branding & Illustration (40%) */}
      <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-primary-50 via-primary-50 to-accent-50 flex-col items-center justify-center p-8 lg:p-12">
        <motion.div
          className="text-center space-y-8 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Image
              src="/logo.jpg"
              alt="Saint Pierre Immobilier"
              width={72}
              height={72}
              className="mx-auto rounded-2xl shadow-lg"
              priority
            />
          </motion.div>

          {/* Branding Content */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-neutral-900">
              Saint Pierre Immobilier
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed">
              Gérez votre portefeuille immobilier simplement et efficacement.
            </p>
          </motion.div>

          {/* Illustration - Property Management */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-64 flex items-center justify-center"
          >
            <svg
              width="240"
              height="240"
              viewBox="0 0 240 240"
              className="mx-auto drop-shadow-lg"
            >
              <defs>
                <linearGradient id="loginGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <filter id="loginShadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Building */}
              <motion.g
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Main structure */}
                <rect
                  x="50"
                  y="70"
                  width="140"
                  height="110"
                  rx="8"
                  fill="url(#loginGrad)"
                  opacity="0.9"
                  filter="url(#loginShadow)"
                />

                {/* Roof */}
                <polygon
                  points="50,70 120,30 190,70"
                  fill="url(#loginGrad)"
                  opacity="0.95"
                />

                {/* Windows - 5x3 grid */}
                {[0, 1, 2].map((row) =>
                  [0, 1, 2, 3, 4].map((col) => (
                    <g key={`window-${row}-${col}`}>
                      <rect
                        x={62 + col * 24}
                        y={85 + row * 20}
                        width="16"
                        height="16"
                        rx="2"
                        fill="#93C5FD"
                        opacity="0.6"
                      />
                      <circle
                        cx={70 + col * 24}
                        cy={93 + row * 20}
                        r="1.5"
                        fill="#1E293B"
                        opacity="0.2"
                      />
                    </g>
                  ))
                )}

                {/* Door */}
                <rect
                  x="105"
                  y="160"
                  width="30"
                  height="40"
                  rx="4"
                  fill="#92400E"
                  opacity="0.7"
                />
                <circle cx="130" cy="180" r="3" fill="#F59E0B" opacity="0.8" />

                {/* Light above door */}
                <circle
                  cx="120"
                  cy="150"
                  r="4"
                  fill="#FCD34D"
                  opacity="0.6"
                />
              </motion.g>

              {/* Ground line */}
              <line x1="20" y1="185" x2="220" y2="185" stroke="#E5E7EB" strokeWidth="2" />
            </svg>
          </motion.div>

          {/* Features List */}
          <motion.div
            className="space-y-3 pt-4 border-t border-primary-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              "Gérez vos biens et logements",
              "Suivez vos paiements en temps réel",
              "Générez des rapports automatisés",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                {feature}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side: Login Form (60%) */}
      <div className="flex-1 md:w-3/5 flex flex-col items-center justify-center px-6 py-8 md:px-12 overflow-y-auto md:overflow-hidden">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Mobile Header */}
          <div className="md:hidden text-center mb-8">
            <Image
              src="/logo.jpg"
              alt="Saint Pierre Immobilier"
              width={56}
              height={56}
              className="mx-auto mb-3 rounded-xl"
              priority
            />
            <h1 className="text-2xl font-bold text-neutral-900">Saint Pierre</h1>
            <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
              Immobilier
            </p>
          </div>

          {/* Form Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-neutral-900">Connexion</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Accédez à votre espace de gestion immobilière
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            noValidate
          >
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 text-sm text-danger-600 bg-danger-50 rounded-lg px-4 py-3 border border-danger-100"
              >
                <WarningCircle size={18} className="mt-0.5 shrink-0" weight="fill" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Adresse email
              </label>
              <div className="relative">
                <EnvelopeSimple
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  weight="regular"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="marie.dossou@gmail.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  weight="regular"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 rounded-lg border border-neutral-300 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Connexion en cours...
                  </motion.span>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Footer */}
          <motion.p
            className="text-center text-xs text-neutral-400 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Accès réservé aux propriétaires enregistrés.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
