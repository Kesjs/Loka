# Requirements Document

## Introduction

Le système Loka doit être reconstruit pour supporter une architecture multi-organisation permettant aux propriétaires individuels, gestionnaires et agences immobilières de gérer leurs portefeuilles locatifs à travers un système de scoping unifié. Cette reconstruction vise à transformer l'application d'une solution mono-utilisateur vers une plateforme collaborative tout en préservant l'expérience existante pour les utilisateurs actuels.

## Glossary

- **Organisation**: Entité technique de scoping représentant un périmètre de gestion. Tous les utilisateurs appartiennent à une organisation, y compris les propriétaires solo.
- **Propriétaire_Solo**: Utilisateur individuel qui gère son propre portefeuille via son organisation personnelle.
- **Gestionnaire**: Utilisateur qui gère plusieurs propriétés pour le compte de différents propriétaires au sein d'une organisation de gestion.
- **Agence**: Organisation de type agence regroupant plusieurs gestionnaires et propriétaires clients.
- **Organisation_Scope_Helper**: Module utilitaire (lib/organisation-scope.ts) fournissant les fonctions de scoping pour toutes les requêtes de données.
- **RLS_Policy**: Règle de sécurité au niveau des lignes (Row-Level Security) utilisant la fonction is_org_member() pour contrôler l'accès aux données.
- **Dashboard_Adaptatif**: Interface d'accueil personnalisée selon le type d'organisation de l'utilisateur connecté.
- **Onboarding_Étendu**: Processus d'inscription enrichi avec 5 nouveaux steps pour configurer l'organisation.
- **Route_Proprietaires**: Page /proprietaires accessible uniquement aux gestionnaires et agences listant leurs clients.
- **Design_System**: Ensemble de styles cohérents définis dans globals.css avec les variables @theme inline.
- **Validation_ARCEP**: Règles de validation spécifiques aux numéros de téléphone béninois (10 chiffres, préfixe 01).

## Requirements

### Requirement 1: Organisation Scoping Infrastructure

**User Story:** En tant que développeur système, je veux un module central de scoping d'organisation, afin que toutes les requêtes de données respectent le périmètre organisationnel de l'utilisateur connecté.

#### Acceptance Criteria

1. THE Organisation_Scope_Helper SHALL expose une fonction getOrganisationId(userId: string) retournant l'ID d'organisation de l'utilisateur
2. THE Organisation_Scope_Helper SHALL expose une fonction withOrgScope(query, userId) appliquant automatiquement le filtre organisation sur toute requête Supabase
3. THE Organisation_Scope_Helper SHALL expose une fonction isOrgMember(userId, orgId) vérifiant l'appartenance d'un utilisateur à une organisation
4. WHEN un utilisateur accède à des données, THE System SHALL appliquer automatiquement le filtre d'organisation via withOrgScope
5. WHERE plusieurs utilisateurs appartiennent à la même organisation, THE System SHALL leur permettre d'accéder aux mêmes données
6. THE Organisation_Scope_Helper SHALL lever une exception si userId est null ou undefined

### Requirement 2: Database Schema Extension

**User Story:** En tant qu'administrateur de base de données, je veux une structure de tables supportant les organisations, afin que le système puisse gérer plusieurs types d'utilisateurs avec des périmètres différents.

#### Acceptance Criteria

1. THE Database SHALL contenir une table organisations avec les colonnes (id, nom, type, created_at, updated_at)
2. THE Table organisations.type SHALL accepter les valeurs enum: 'solo', 'gestionnaire', 'agence'
3. THE Database SHALL contenir une table organisation_members avec les colonnes (organisation_id, user_id, role, joined_at)
4. THE Database SHALL ajouter une colonne organisation_id UUID sur les tables: immeubles, logements, contrats, paiements, locataires
5. THE Database SHALL créer des index sur organisation_id pour toutes les tables modifiées
6. WHEN un utilisateur crée un compte, THE System SHALL créer automatiquement une organisation de type 'solo'
7. THE Database SHALL définir une fonction PostgreSQL is_org_member(user_id UUID, org_id UUID) retournant BOOLEAN

### Requirement 3: Row-Level Security Policies

**User Story:** En tant qu'administrateur de sécurité, je veux des politiques RLS basées sur l'appartenance organisationnelle, afin que les utilisateurs ne puissent accéder qu'aux données de leur organisation.

#### Acceptance Criteria

1. THE RLS_Policy pour la table immeubles SHALL autoriser SELECT uniquement si is_org_member(auth.uid(), organisation_id) retourne TRUE
2. THE RLS_Policy pour la table logements SHALL autoriser SELECT uniquement si is_org_member(auth.uid(), organisation_id) retourne TRUE
3. THE RLS_Policy pour la table contrats SHALL autoriser SELECT uniquement si is_org_member(auth.uid(), organisation_id) retourne TRUE
4. THE RLS_Policy pour la table paiements SHALL autoriser SELECT uniquement si is_org_member(auth.uid(), organisation_id) retourne TRUE
5. THE RLS_Policy pour la table locataires SHALL autoriser SELECT uniquement si is_org_member(auth.uid(), organisation_id) retourne TRUE
6. THE RLS_Policy SHALL appliquer les mêmes règles aux opérations INSERT, UPDATE, DELETE
7. IF un utilisateur tente d'accéder à des données hors de son organisation, THEN THE Database SHALL retourner un ensemble vide sans erreur

### Requirement 4: Extended Onboarding Flow

**User Story:** En tant que nouvel utilisateur, je veux un processus d'inscription guidé en plusieurs étapes, afin de configurer correctement mon organisation et mes informations de gestion.

#### Acceptance Criteria

1. THE Onboarding_Étendu SHALL ajouter 5 nouveaux steps au processus d'inscription existant
2. THE Step_Organisation SHALL demander le type d'organisation (solo, gestionnaire, agence)
3. THE Step_Profil SHALL demander le nom complet et le numéro de téléphone avec Validation_ARCEP
4. THE Step_Adresse SHALL demander l'adresse complète de l'utilisateur ou de l'agence
5. THE Step_Préférences SHALL demander la devise par défaut et le fuseau horaire
6. THE Step_Confirmation SHALL afficher un récapitulatif avant création du compte
7. WHEN le téléphone ne respecte pas la Validation_ARCEP, THEN THE System SHALL afficher un message d'erreur "Numéro invalide: doit contenir 10 chiffres et commencer par 01"
8. WHEN l'utilisateur valide le Step_Confirmation, THEN THE System SHALL créer simultanément le compte user et l'enregistrement organisation
9. THE Onboarding_Étendu SHALL utiliser les icônes Phosphor Icons exclusivement
10. THE Onboarding_Étendu SHALL préserver le Design_System avec les variables @theme inline de globals.css

### Requirement 5: Adaptive Dashboard

**User Story:** En tant qu'utilisateur connecté, je veux un tableau de bord adapté à mon type d'organisation, afin de visualiser les informations pertinentes pour mon rôle.

#### Acceptance Criteria

1. WHEN un Propriétaire_Solo accède au dashboard, THE Dashboard_Adaptatif SHALL afficher l'interface existante pixel-identique
2. WHEN un Gestionnaire accède au dashboard, THE Dashboard_Adaptatif SHALL afficher une vue agrégée de tous les propriétaires gérés
3. WHEN une Agence accède au dashboard, THE Dashboard_Adaptatif SHALL afficher des statistiques consolidées de tous les membres
4. THE Dashboard_Adaptatif SHALL charger le type d'organisation depuis la base de données au montage du composant
5. THE Dashboard_Adaptatif SHALL utiliser React Suspense avec skeleton loaders pendant le chargement
6. WHERE l'utilisateur est de type 'solo', THE Dashboard_Adaptatif SHALL masquer les sections multi-utilisateurs
7. THE Dashboard_Adaptatif SHALL préserver toutes les animations Framer Motion existantes

### Requirement 6: Organisation Scope Correction - Existing Pages

**User Story:** En tant que développeur, je veux corriger le scoping sur 5 pages existantes, afin que les données affichées respectent le périmètre organisationnel.

#### Acceptance Criteria

1. THE Page /logements SHALL utiliser withOrgScope pour filtrer les logements affichés
2. THE Page /contrats SHALL utiliser withOrgScope pour filtrer les contrats affichés
3. THE Page /paiements SHALL utiliser withOrgScope pour filtrer les paiements affichés
4. THE Page /locataires SHALL utiliser withOrgScope pour filtrer les locataires affichés
5. THE Page /parametres SHALL utiliser withOrgScope pour charger les paramètres d'organisation
6. WHEN withOrgScope est appliqué, THE System SHALL conserver tous les filtres utilisateur existants (statut, date, recherche)
7. THE Corrected_Pages SHALL maintenir les mêmes performances de chargement qu'avant la correction

### Requirement 7: Proprietaires Route (Gestionnaire/Agence Only)

**User Story:** En tant que gestionnaire ou agence, je veux une page /proprietaires listant mes clients, afin de gérer facilement les propriétaires dont je m'occupe.

#### Acceptance Criteria

1. THE Route_Proprietaires SHALL être accessible uniquement si le type d'organisation est 'gestionnaire' ou 'agence'
2. IF un Propriétaire_Solo accède à /proprietaires, THEN THE System SHALL rediriger vers le dashboard avec un message "Accès non autorisé"
3. THE Route_Proprietaires SHALL afficher un tableau avec colonnes: Nom, Téléphone, Nombre de biens, Loyer total mensuel, Statut
4. THE Route_Proprietaires SHALL permettre de filtrer par nom et par statut (actif, inactif)
5. THE Route_Proprietaires SHALL permettre de trier par chaque colonne
6. WHEN un gestionnaire clique sur un propriétaire, THE System SHALL naviguer vers une vue détaillée /proprietaires/[id]
7. THE Route_Proprietaires SHALL utiliser pagination avec 20 éléments par page
8. THE Route_Proprietaires SHALL respecter le Design_System avec icônes Phosphor Icons

### Requirement 8: Dead Code Removal

**User Story:** En tant que mainteneur de code, je veux supprimer le code non utilisé identifié, afin d'améliorer la maintenabilité et de réduire la surface d'attaque.

#### Acceptance Criteria

1. THE System SHALL supprimer complètement le fichier lib/services/ReceiptService.ts
2. THE System SHALL supprimer complètement la fonction sendPaymentConfirmationEmail de tous les fichiers
3. WHEN le code mort est supprimé, THE System SHALL maintenir toutes les fonctionnalités utilisateur existantes
4. THE System SHALL supprimer toutes les importations de ReceiptService et sendPaymentConfirmationEmail
5. THE Build Process SHALL réussir sans erreurs après suppression du code mort
6. THE Test Suite SHALL réussir sans erreurs après suppression du code mort

### Requirement 9: Native Select Replacement

**User Story:** En tant qu'utilisateur, je veux des composants select stylisés uniformément, afin d'avoir une expérience utilisateur cohérente dans toute l'application.

#### Acceptance Criteria

1. THE System SHALL remplacer les 12 éléments HTML `<select>` natifs par le composant shadcn/ui Select
2. THE shadcn_Select SHALL respecter le Design_System avec les variables @theme de globals.css
3. THE shadcn_Select SHALL supporter toutes les fonctionnalités des select natifs (value, onChange, disabled, multiple options)
4. THE shadcn_Select SHALL utiliser les icônes Phosphor Icons pour les chevrons dropdown
5. WHEN un select est en état disabled, THE shadcn_Select SHALL afficher un style grisé avec opacité 0.5
6. THE shadcn_Select SHALL supporter le clavier (Arrow Up/Down, Enter, Escape) pour l'accessibilité
7. WHERE un select natif avait un placeholder, THE shadcn_Select SHALL afficher le même texte avec style text-muted-foreground

### Requirement 10: Settings Page Reconstruction

**User Story:** En tant qu'utilisateur, je veux une page de paramètres réorganisée en sections claires, afin de configurer facilement mon compte et mon organisation.

#### Acceptance Criteria

1. THE Page /parametres SHALL être organisée en 4 sections: Profil, Organisation, Notifications, Sécurité
2. THE Section_Profil SHALL permettre de modifier: nom, email, téléphone (avec Validation_ARCEP), photo de profil
3. THE Section_Organisation SHALL permettre de modifier: nom d'organisation, devise, fuseau horaire
4. THE Section_Notifications SHALL permettre d'activer/désactiver: emails d'alerte, rappels de paiement, rapports mensuels
5. THE Section_Sécurité SHALL permettre de changer le mot de passe et de voir les sessions actives
6. WHEN l'utilisateur modifie son téléphone, THE System SHALL valider avec Validation_ARCEP avant enregistrement
7. WHEN une modification est enregistrée, THE System SHALL afficher un toast de confirmation avec animation
8. THE Page /parametres SHALL utiliser le composant Tabs de shadcn/ui pour la navigation entre sections
9. THE Page /parametres SHALL respecter le Design_System avec espacement cohérent et icônes Phosphor Icons

### Requirement 11: Logements Filter Correction

**User Story:** En tant qu'utilisateur, je veux un filtre de recherche fonctionnel sur la page /logements, afin de trouver rapidement les logements par nom ou adresse.

#### Acceptance Criteria

1. THE Filter_Logements SHALL permettre de rechercher par nom de logement (case-insensitive)
2. THE Filter_Logements SHALL permettre de rechercher par adresse de logement (case-insensitive)
3. THE Filter_Logements SHALL permettre de filtrer par statut (occupé, vacant, en_travaux)
4. WHEN l'utilisateur tape dans le champ de recherche, THE System SHALL appliquer le filtre avec un debounce de 300ms
5. THE Filter_Logements SHALL combiner la recherche textuelle et le filtre statut en mode AND
6. THE Filter_Logements SHALL afficher le nombre de résultats trouvés (ex: "12 logements trouvés")
7. WHERE aucun logement ne correspond aux critères, THE System SHALL afficher un état vide avec message "Aucun logement trouvé"
8. THE Filter_Logements SHALL préserver le scoping organisation via withOrgScope

### Requirement 12: Non-Regression for Individual Accounts

**User Story:** En tant que propriétaire solo existant, je veux que mon expérience reste identique après la migration, afin de continuer à utiliser l'application sans perturbation.

#### Acceptance Criteria

1. THE System SHALL afficher le dashboard existant pixel-identique pour les comptes de type 'solo'
2. THE System SHALL masquer la Route_Proprietaires pour les comptes de type 'solo'
3. THE System SHALL créer automatiquement une organisation 'solo' pour tous les comptes utilisateurs existants lors de la migration
4. WHEN un Propriétaire_Solo accède aux pages /logements, /contrats, /paiements, THE System SHALL afficher uniquement ses propres données
5. THE System SHALL préserver toutes les fonctionnalités existantes: création contrat, enregistrement paiement, génération de rapport
6. THE System SHALL maintenir les mêmes temps de chargement (±10%) pour les comptes solo après migration
7. WHERE un Propriétaire_Solo utilise la recherche ou les filtres, THE System SHALL conserver le comportement actuel

### Requirement 13: Phone Validation ARCEP Benin

**User Story:** En tant que système de validation, je veux appliquer les règles ARCEP du Bénin aux numéros de téléphone, afin de garantir que seuls les numéros valides sont enregistrés.

#### Acceptance Criteria

1. THE Validation_ARCEP SHALL accepter uniquement les numéros de 10 chiffres
2. THE Validation_ARCEP SHALL accepter uniquement les numéros commençant par le préfixe "01"
3. THE Validation_ARCEP SHALL accepter les formats: "01XXXXXXXX", "+22901XXXXXXXX", "22901XXXXXXXX"
4. WHEN le format inclut +229 ou 229, THE System SHALL le normaliser en retirant le préfixe pays
5. IF un numéro ne respecte pas les critères, THEN THE System SHALL retourner le message d'erreur "Numéro invalide: doit contenir 10 chiffres et commencer par 01"
6. THE Validation_ARCEP SHALL être implémentée comme une fonction réutilisable validatePhoneNumber(phone: string): boolean
7. THE Validation_ARCEP SHALL être appliquée dans: Onboarding_Étendu, Page /parametres, Création locataire, Création propriétaire

### Requirement 14: Design System Preservation

**User Story:** En tant que designer, je veux que toutes les nouvelles interfaces respectent le système de design existant, afin de maintenir une cohérence visuelle dans l'application.

#### Acceptance Criteria

1. THE System SHALL utiliser exclusivement les icônes de la bibliothèque Phosphor Icons
2. THE System SHALL utiliser les variables CSS @theme définies dans globals.css pour toutes les couleurs
3. THE System SHALL respecter l'espacement cohérent: gap-4 pour les grilles, space-y-6 pour les sections verticales
4. THE System SHALL utiliser les composants shadcn/ui pour tous les éléments d'interface (Button, Card, Input, Select, Tabs, Dialog)
5. THE System SHALL appliquer les animations Framer Motion avec les variants existants (pageVariants, containerVariants, itemVariants)
6. THE System SHALL maintenir la hiérarchie typographique: text-2xl font-bold pour h1, text-xl font-semibold pour h2
7. WHERE un nouveau composant est créé, THE System SHALL documenter son utilisation avec un exemple dans Storybook

### Requirement 15: Execution Order and Dependencies

**User Story:** En tant que chef de projet technique, je veux un ordre d'exécution défini pour l'implémentation, afin de minimiser les régressions et les blocages entre les tâches.

#### Acceptance Criteria

1. THE Implementation SHALL commencer par Requirement 1 (Organisation_Scope_Helper) avant tout autre développement
2. WHEN Organisation_Scope_Helper est complété, THE Implementation SHALL continuer avec Requirement 2 (Database Schema)
3. WHEN Database Schema est complété, THE Implementation SHALL continuer avec Requirement 3 (RLS Policies)
4. THE Implementation SHALL compléter Requirements 1-3 avant de commencer Requirements 4-7 (features utilisateur)
5. THE Implementation SHALL compléter Requirement 8 (Dead Code Removal) avant Requirement 9 (Select Replacement)
6. THE Implementation SHALL tester Requirement 12 (Non-Regression) après chaque feature majeure
7. THE Implementation SHALL valider Requirement 14 (Design System) par une revue visuelle avant chaque merge

## Acceptance Checklist

Cette liste de 18 points doit être validée avant de considérer la feature comme complète:

1. [ ] Organisation_Scope_Helper créé et testé avec 100% de couverture
2. [ ] Tables organisations et organisation_members créées avec indexes
3. [ ] Colonne organisation_id ajoutée sur les 5 tables cibles
4. [ ] Fonction PostgreSQL is_org_member() créée et testée
5. [ ] RLS policies activées et validées sur les 5 tables
6. [ ] Onboarding étendu fonctionnel avec les 5 nouveaux steps
7. [ ] Validation_ARCEP implémentée et testée
8. [ ] Dashboard adaptatif affiche correctement pour les 3 types d'organisation
9. [ ] 5 pages existantes corrigées avec withOrgScope
10. [ ] Route /proprietaires accessible uniquement aux gestionnaires/agences
11. [ ] Code mort (ReceiptService, sendPaymentConfirmationEmail) supprimé
12. [ ] 12 select natifs remplacés par shadcn/ui Select
13. [ ] Page /parametres reconstruite en 4 sections
14. [ ] Filtre /logements corrigé et fonctionnel
15. [ ] Tests de non-régression validés pour comptes solo
16. [ ] Design system respecté (icônes Phosphor, variables @theme)
17. [ ] Performance maintenue (temps de chargement ±10%)
18. [ ] Documentation technique mise à jour dans ARCHITECTURE.md
