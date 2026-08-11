# 🧪 Test du Parcours Utilisateur Complet

**Date:** 11 août 2026  
**Objectif:** Vérifier le parcours end-to-end de l'onboarding au dashboard pour chaque rôle

---

## 📋 Préparation des Tests

### Prérequis
- [ ] Serveur de développement lancé (`npm run dev`)
- [ ] Base de données Supabase accessible
- [ ] Console développeur ouverte (pour voir les logs)
- [ ] Email de test disponible pour inscription

### Configuration de Test
```bash
# Terminal 1: Lancer le serveur
cd Loka-main
npm run dev

# Terminal 2: Vérifier les logs
# Suivre les logs console du navigateur
```

---

## 🎯 Scénarios de Test

### Test 1️⃣: Propriétaire Individuel avec Logement Occupé

**Profil:** Propriétaire d'un immeuble avec 1 logement loué

#### Étapes à Suivre

1. **Inscription/Connexion**
   - [ ] Aller sur `http://localhost:3000`
   - [ ] Cliquer "S'inscrire"
   - [ ] Email: `test-proprio@example.com`
   - [ ] Mot de passe: `Test1234!`
   - [ ] Vérifier: Redirection vers `/onboarding`

2. **Étape Welcome**
   - [ ] Saisir nom: `Jean Martin`
   - [ ] Saisir téléphone: `+228 90 12 34 56`
   - [ ] Cliquer "Suivant"
   - [ ] Vérifier: Transition fluide vers étape suivante

3. **Étape Rôle**
   - [ ] Sélectionner: "Propriétaire"
   - [ ] Vérifier: Animation de sélection
   - [ ] Cliquer "Suivant"

4. **Étape Bien Immobilier**
   - [ ] Nom du bien: `Résidence Les Palmiers`
   - [ ] Type: `Immeuble`
   - [ ] Adresse: `Boulevard de la Paix`
   - [ ] Ville: `Lomé`
   - [ ] Quartier: `Agbalépédogan`
   - [ ] Cliquer "Suivant"

5. **Étape Nombre de Logements**
   - [ ] Sélectionner: `1 logement`
   - [ ] Vérifier: Génération automatique "Logement 1"
   - [ ] Cliquer "Suivant"

6. **Étape Occupation**
   - [ ] Cocher "Ce logement est occupé"
   - [ ] Nom logement: `Studio 1er étage`
   - [ ] Nom locataire: `Kofi Mensah`
   - [ ] Téléphone: `+228 91 23 45 67`
   - [ ] Loyer: `150 000`
   - [ ] Date début: `2026-01-01`
   - [ ] Cliquer "Suivant"

7. **Étape Paiement**
   - [ ] Moyen paiement: `Mobile Money`
   - [ ] Garantie: Activée
   - [ ] Montant garantie: `300 000`
   - [ ] Cliquer "Suivant"

8. **Étape Complete (Récapitulatif)**
   - [ ] Vérifier affichage: "🎉 Bravo, Jean !"
   - [ ] Vérifier badge rôle: "Propriétaire individuel"
   - [ ] Vérifier stats: 1 Bien, 1 Logement, 1 Locataire
   - [ ] Vérifier occupation: 1 occupé, 0 vacant
   - [ ] Vérifier revenu mensuel: `150 000 FCFA`
   - [ ] Vérifier devise: `FCFA`
   - [ ] Vérifier garantie: `300 000`
   - [ ] Vérifier message personnalisé pour propriétaire
   - [ ] Console: Vérifier logs `📝 [saveOnboarding]`
   - [ ] Cliquer "Accéder à mon tableau de bord"

9. **Dashboard Individuel**
   - [ ] Vérifier: URL est `/home`
   - [ ] Vérifier: Header "Bienvenue, Jean Martin"
   - [ ] Vérifier: Sous-titre "Gérez votre portefeuille immobilier"
   - [ ] Vérifier: Stats affichées (1 immeuble, 1 logement)
   - [ ] Vérifier: Revenu mensuel 150 000 FCFA
   - [ ] Vérifier: Taux d'occupation 100%
   - [ ] Vérifier: Pas de sections "Clients Gérés" ou "Équipe"
   - [ ] Vérifier: CTA "Ajouter un immeuble" / "Ajouter un logement"
   - [ ] Console: Vérifier logs getDashboardData()

10. **Navigation**
    - [ ] Ouvrir sidebar
    - [ ] Vérifier: 9 items de navigation (pas de "Propriétaires", "Reversements", "Équipe")
    - [ ] Cliquer "Immeubles"
    - [ ] Vérifier: Liste avec "Résidence Les Palmiers"

#### Résultat Attendu
✅ Parcours fluide de bout en bout  
✅ Toutes les données enregistrées correctement  
✅ Dashboard individuel affiché avec bonnes stats  
✅ Navigation filtrée pour propriétaire individuel

---

### Test 2️⃣: Gestionnaire avec Propriétaires Gérés

**Profil:** Gestionnaire mandataire avec portefeuille de clients

#### Étapes à Suivre

1. **Inscription/Connexion**
   - [ ] Nouveau compte: `test-gestionnaire@example.com`
   - [ ] Mot de passe: `Test1234!`
   - [ ] Vérifier: Redirection vers `/onboarding`

2. **Welcome → Rôle**
   - [ ] Nom: `Marie Kouassi`
   - [ ] Téléphone: `+225 07 12 34 56 78`
   - [ ] Rôle: Sélectionner "Gestionnaire"

3. **Étape Situation** (nouveau pour gestionnaire)
   - [ ] Vérifier: Question "Votre situation actuelle"
   - [ ] Sélectionner: "J'ai déjà des propriétaires mandants"
   - [ ] Cliquer "Suivant"

4. **Étape Propriétaire Géré**
   - [ ] Nom: `Monsieur Yao`
   - [ ] Téléphone: `+225 01 23 45 67 89`
   - [ ] Cliquer "Suivant"

5. **Bien → Logements → Paiement**
   - [ ] Bien: `Villa Cocody`
   - [ ] Type: `Villa`
   - [ ] Ville: `Abidjan`
   - [ ] 3 logements (T2, T3, Studio)
   - [ ] 2 occupés, 1 vacant
   - [ ] Loyers: 200 000, 300 000, 150 000

6. **Étape Complete**
   - [ ] Vérifier badge: "Gestionnaire mandataire" (couleur ambre)
   - [ ] Vérifier stats: 1 Bien, 3 Logements, 2 Locataires
   - [ ] Vérifier occupation: 2 occupés, 1 vacant
   - [ ] Vérifier revenu: `500 000 FCFA` (200k + 300k)
   - [ ] Vérifier message: "Votre espace gestionnaire..."
   - [ ] Cliquer "Accéder à mon tableau de bord"

7. **Dashboard Gestionnaire**
   - [ ] Vérifier: Header "Bienvenue, Marie Kouassi"
   - [ ] Vérifier: Sous-titre "Gérez votre portefeuille de clients"
   - [ ] Vérifier: Section "Clients Gérés" présente
   - [ ] Vérifier: CTA "Ajouter un bien" + "Ajouter un client"
   - [ ] Vérifier: Stats incluent propriétaires gérés

8. **Navigation**
   - [ ] Sidebar: 11 items (avec "Propriétaires" et "Reversements")
   - [ ] Pas d'item "Équipe" (réservé agence)
   - [ ] Cliquer "Propriétaires"
   - [ ] Vérifier: Liste avec "Monsieur Yao"

#### Résultat Attendu
✅ Étapes spécifiques gestionnaire apparaissent  
✅ Dashboard gestionnaire avec section clients  
✅ Navigation étendue (11 items)  
✅ Scope inclut propriétaires gérés

---

### Test 3️⃣: Agence Immobilière

**Profil:** Agence avec équipe et multiple propriétaires

#### Étapes à Suivre

1. **Inscription/Connexion**
   - [ ] Nouveau compte: `test-agence@example.com`
   - [ ] Vérifier: Redirection `/onboarding`

2. **Welcome → Rôle**
   - [ ] Nom: `Agence Premium Immo`
   - [ ] Téléphone: `+228 22 12 34 56`
   - [ ] Rôle: "Agence immobilière"

3. **Étape Agence Info** (nouveau pour agence)
   - [ ] Nom agence: `Premium Immo`
   - [ ] Ville: `Lomé`
   - [ ] Taille portefeuille: `10-50 biens`
   - [ ] Cliquer "Suivant"

4. **Propriétaire Géré**
   - [ ] Nom: `Société ABC`
   - [ ] Téléphone: `+228 90 11 22 33`

5. **Bien → Logements**
   - [ ] Immeuble: `Résidence Étoile`
   - [ ] Type: `Immeuble`
   - [ ] 5 logements
   - [ ] 4 occupés, 1 vacant

6. **Étape Complete**
   - [ ] Vérifier badge: "Agence immobilière" (couleur bleue)
   - [ ] Vérifier gradient bleu sur header
   - [ ] Vérifier stats: 1 Bien, 5 Logements, 4 Locataires
   - [ ] Vérifier message: "Votre tableau de bord agence..."
   - [ ] Animation de succès visible

7. **Dashboard Agence**
   - [ ] Vérifier: "Tableau de bord agence immobilière"
   - [ ] Vérifier: Sections "Clients" ET "Équipe"
   - [ ] Vérifier: CTA "Voir les clients" + "Voir l'équipe"
   - [ ] Vérifier: Vue globale portefeuille

8. **Navigation**
   - [ ] Sidebar: 12 items (TOUS, y compris "Équipe")
   - [ ] Cliquer "Équipe"
   - [ ] Vérifier: Page équipe accessible

#### Résultat Attendu
✅ Workflow agence complet  
✅ Dashboard avec sections Clients + Équipe  
✅ Navigation complète (12 items)  
✅ Branding agence visible

---

### Test 4️⃣: Validation des Erreurs

**Objectif:** Vérifier que la validation empêche les données invalides

#### Test 4.1: Nom Vide
- [ ] Onboarding: Laisser le nom vide
- [ ] Aller jusqu'à "Complete"
- [ ] Cliquer "Accéder à mon tableau de bord"
- [ ] **Attendu:** Erreur "Le nom est obligatoire"
- [ ] **Attendu:** Scroll automatique vers le haut
- [ ] **Attendu:** Pas de redirection

#### Test 4.2: Logement Occupé Sans Locataire
- [ ] Créer logement
- [ ] Cocher "occupé"
- [ ] Laisser nom locataire vide
- [ ] Aller à "Complete"
- [ ] Cliquer bouton final
- [ ] **Attendu:** Erreur avec nom du logement mentionné
- [ ] **Attendu:** Section "Logements" indiquée

#### Test 4.3: Loyer Zéro
- [ ] Logement occupé avec loyer = 0
- [ ] **Attendu:** Erreur "Le loyer ne peut pas être zéro"

#### Test 4.4: Dates Incohérentes
- [ ] Date début: 2026-12-01
- [ ] Date fin: 2026-01-01
- [ ] **Attendu:** Erreur "date fin doit être après date début"

#### Test 4.5: Type de Bien Invalide
- [ ] (Nécessite manipulation manuelle du state)
- [ ] Forcer type = "invalide"
- [ ] **Attendu:** Validation bloque

#### Test 4.6: Aucun Logement
- [ ] Supprimer tous les logements
- [ ] **Attendu:** "Vous devez configurer au moins un logement"

#### Résultat Attendu
✅ Toutes les validations bloquent la soumission  
✅ Messages d'erreur clairs et spécifiques  
✅ Scroll automatique vers erreurs  
✅ Pas d'appel API si validation échoue

---

### Test 5️⃣: Gestion d'Erreurs Réseau

**Objectif:** Tester la robustesse face aux erreurs

#### Test 5.1: Déconnexion Réseau
- [ ] Compléter onboarding normalement
- [ ] Juste avant "Complete", couper le réseau
- [ ] Cliquer "Accéder à mon tableau de bord"
- [ ] **Attendu:** Message d'erreur réseau
- [ ] **Attendu:** Suggestion "Vérifiez votre connexion"
- [ ] Reconnecter le réseau
- [ ] Réessayer
- [ ] **Attendu:** Succès

#### Test 5.2: Session Expirée
- [ ] Démarrer onboarding
- [ ] Attendre expiration session (ou forcer logout)
- [ ] Cliquer "Complete"
- [ ] **Attendu:** "Session expirée, merci de vous reconnecter"
- [ ] **Attendu:** Redirection vers login

#### Test 5.3: Erreur Base de Données
- [ ] (Nécessite simulation côté serveur)
- [ ] Forcer échec insertion
- [ ] **Attendu:** Message explicite
- [ ] **Attendu:** Logs détaillés console

#### Résultat Attendu
✅ Erreurs capturées et affichées proprement  
✅ Pas de crash application  
✅ Actions de récupération proposées  
✅ Logs utiles pour debugging

---

## 🔄 Tests de Régression

### Après Modifications du Code

- [ ] **Test 1:** Propriétaire individuel fonctionne toujours
- [ ] **Test 2:** Gestionnaire fonctionne toujours
- [ ] **Test 3:** Agence fonctionne toujours
- [ ] **Test 4:** Validations toujours actives
- [ ] **Test 5:** Gestion erreurs toujours robuste

### Après Modifications de Base de Données

- [ ] Vérifier schéma `organisations.type` ENUM intact
- [ ] Vérifier RLS policies actives
- [ ] Vérifier contraintes FK
- [ ] Re-tester un parcours complet

---

## 📊 Checklist de Vérification Visuelle

### Design du Récapitulatif (StepComplete)

- [ ] **Header avec animation**
  - [ ] Icône succès avec ping animé ✨
  - [ ] Gradient de fond selon rôle
  - [ ] Message personnalisé avec prénom

- [ ] **Carte récapitulatif**
  - [ ] Header coloré avec icône rôle
  - [ ] 3 statistiques principales (Biens, Logements, Locataires)
  - [ ] Section détails du bien (nom, type, ville)
  - [ ] Section occupation (occupés/vacants, revenus)
  - [ ] Section préférences (devise, garantie)
  - [ ] Message personnalisé selon rôle

- [ ] **Gestion d'erreur**
  - [ ] Bandeau rouge avec icône
  - [ ] Message d'erreur clair
  - [ ] Section conseil "💡 Que faire ?"

- [ ] **Bouton d'action**
  - [ ] Gradient selon rôle
  - [ ] État loading avec spinner
  - [ ] Icône flèche
  - [ ] Message sécurité "🔒"

### Dashboard

- [ ] **Header**
  - [ ] Nom utilisateur affiché
  - [ ] Sous-titre adapté au rôle

- [ ] **Stats**
  - [ ] Cartes avec icônes
  - [ ] Valeurs correctes
  - [ ] Formatage montants

- [ ] **Sections spécifiques**
  - [ ] Individuel: CTA immeubles/logements
  - [ ] Gestionnaire: Section clients + CTA clients
  - [ ] Agence: Sections clients + équipe

- [ ] **Navigation**
  - [ ] Items filtrés selon rôle
  - [ ] Nombre d'items correct
  - [ ] Liens fonctionnels

---

## 🐛 Bugs à Surveiller

### Connus et Corrigés ✅
- [x] Requête paiements sans jointure → **CORRIGÉ**
- [x] Requête contrats sans jointure → **CORRIGÉ**
- [x] Dashboard null sans fallback → **CORRIGÉ**
- [x] Profil invalide sans vérification → **CORRIGÉ**
- [x] Validation manquante avant save → **CORRIGÉ**

### À Surveiller ⚠️
- [ ] Performance avec >50 logements
- [ ] Timeout sur réseau lent
- [ ] Race condition auto-save vs submit
- [ ] Duplication si double-clic bouton
- [ ] Gestion caractères spéciaux dans noms

---

## 📈 Critères de Succès

### Fonctionnels
- ✅ 100% des parcours testés fonctionnent
- ✅ Aucune erreur console (sauf warnings Next.js normaux)
- ✅ Toutes les données enregistrées en DB
- ✅ Routing correct vers dashboard approprié

### UX
- ✅ Temps de complétion <3 min par parcours
- ✅ 0 blocage utilisateur
- ✅ Messages d'erreur clairs et actionnables
- ✅ Design professionnel et soigné

### Performance
- ✅ Temps validation <100ms
- ✅ Temps sauvegarde <2s (réseau normal)
- ✅ Pas de lag lors des animations
- ✅ Chargement dashboard <1s

### Sécurité
- ✅ Validation bloque données invalides
- ✅ Sanitization appliquée
- ✅ Logs appropriés (pas de données sensibles)
- ✅ RLS policies respectées

---

## 🏁 Rapport de Test Final

### Template à Remplir

```
Date: ___________
Testeur: ___________

Tests Réalisés:
[ ] Test 1: Propriétaire Individuel
[ ] Test 2: Gestionnaire
[ ] Test 3: Agence
[ ] Test 4: Validation Erreurs
[ ] Test 5: Gestion Erreurs Réseau

Résultats:
- Tests réussis: ___/5
- Tests échoués: ___/5
- Bugs critiques: ___
- Bugs mineurs: ___

Commentaires:
_________________________________
_________________________________
_________________________________

Conclusion:
[ ] ✅ Prêt pour production
[ ] ⚠️ Corrections mineures nécessaires
[ ] ❌ Corrections majeures requises
```

---

## 📞 Support et Debugging

### En Cas de Problème

1. **Vérifier les logs console**
   ```
   [saveOnboarding] logs doivent être présents
   getDashboardData() logs doivent être visibles
   ```

2. **Vérifier la base de données**
   ```sql
   -- Vérifier organisation créée
   SELECT * FROM organisations WHERE owner_user_id = 'user-id';
   
   -- Vérifier immeubles
   SELECT * FROM immeubles WHERE organisation_id = 'org-id';
   
   -- Vérifier logements
   SELECT * FROM logements WHERE immeuble_id = 'immeuble-id';
   ```

3. **Vérifier middleware**
   ```
   Logs middleware dans terminal serveur
   Vérifier redirections
   ```

4. **Consulter les documents**
   - ONBOARDING_ANALYSIS_REPORT.md
   - ROUTING_VERIFICATION.md
   - SECURITY_IMPROVEMENTS.md

---

## ✅ Validation Finale

Une fois tous les tests passés:

- [ ] Créer un commit avec tous les changements
- [ ] Pousser sur branche `feature/onboarding-improvements`
- [ ] Créer PR avec rapport de tests
- [ ] Demander code review
- [ ] Merger après validation
- [ ] Déployer en staging
- [ ] Tests finaux en staging
- [ ] Déploiement production

**Système prêt pour production! 🚀**
