import Link from "next/link";
import { Buildings, ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              <Buildings size={22} weight="duotone" />
            </div>
            <span className="text-lg font-black text-white">Loka</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 text-xs leading-relaxed text-slate-300">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">Politique de Confidentialité</h1>
          <p className="mt-1 text-slate-400">Conformité APDP Bénin · Mise à jour : Août 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Engagement de Protection des Données</h2>
          <p>
            Loka attache une importance capitale au respect de la vie privée de ses utilisateurs. Les traitements de données à caractère personnel effectués sur la plateforme respectent la loi relative à la protection des données personnelles en République du Bénin et les directives de l'APDP.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Données Collectées</h2>
          <p>
            Les données collectées se limitent au strict nécessaire pour l'exécution du service : identité, coordonnées téléphoniques Bénin (+229), adresses email, détails des logements et historique des règlements de loyer.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Non-Revente des Données</h2>
          <p>
            Loka ne commercialise et ne loue aucune donnée personnelle ou financière à des tiers. Les informations relatives aux locataires et bailleurs restent strictement confidentielles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Sécurité des Transmissions</h2>
          <p>
            Toutes les transactions et transmissions de données sont chiffrées au moyen du protocole TLS/SSL 256 bits. Les données de paiement Mobile Money sont traitées de manière sécurisée par GeniusPay.
          </p>
        </section>
      </main>
    </div>
  );
}
