# Saint Pierre Immobilier

Application de gestion locative — MVP à propriétaire unique.

## Stack

- Next.js 16 (App Router)
- Supabase (auth + base de données + RLS)
- Tailwind CSS v4
- shadcn/ui + Radix
- Recharts (graphiques dashboard)
- Framer Motion (animations)

## Fonctionnalités MVP

- Connexion propriétaire (pas de signup, compte créé manuellement)
- Onboarding pour saisir les données initiales
- Gestion des immeubles, logements, locataires, contrats
- Saisie manuelle des paiements de loyer
- Génération automatique de quittances PDF
- Dashboard : loyers collectés, retards, taux d'occupation
- Centre de notifications

## Développement

\`\`\`bash
npm install
npm run dev
\`\`\`

Ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Créer un fichier `.env.local` avec :

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
\`\`\`
