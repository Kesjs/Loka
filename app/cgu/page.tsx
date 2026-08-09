import Link from "next/link";
import { Buildings, ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default function CguPage() {
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
          <h1 className="text-2xl font-black text-white sm:text-3xl">Conditions Générales d'Utilisation</h1>
          <p className="mt-1 text-slate-400">Dernière mise à jour : 09 Août 2026 · République du Bénin 🇧🇯</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Objet & Cadre Réglementaire</h2>
          <p>
            La plateforme Loka est un service numérique édité pour la gestion locative et l'encaissement de loyers. Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation des services par les propriétaires, les gestionnaires mandataires, les agences immobilières et les locataires en République du Bénin, conformément aux dispositions du Code Foncier et Domanial (Loi n° 2013-01).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Valeur des Quittances et Baux Numériques</h2>
          <p>
            Les quittances de loyer générées via Loka constituent des reçus dématérialisés certifiés. Elles ont valeur probante de libération de dette de loyer pour la période mentionnée. Les contrats de bail générés intègrent les clauses obligatoires conformes aux textes réglementaires du Bénin.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Encaissements Mobile Money & GeniusPay</h2>
          <p>
            Les règlements effectués par Mobile Money (MTN MoMo, Moov Money) ou cartes bancaires sont traités par l'opérateur agréé GeniusPay. Loka agit en qualité d'intermédiaire technique et ne stocke pas directement les fonds des transactions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Protection de la Marque du Client</h2>
          <p>
            Chaque propriétaire, gestionnaire ou agence immobilière conserve l'entière propriété de sa marque, de son logo et de ses signes distinctifs affichés sur son compte et ses quittances émises.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Droit Applicable & Juridiction</h2>
          <p>
            Les présentes CGU sont soumises au droit béninois. Tout litige relatif à leur interprétation ou leur exécution relève de la compétence exclusive des tribunaux de Cotonou.
          </p>
        </section>
      </main>
    </div>
  );
}
