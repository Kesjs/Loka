# 🔐 Préparation Espace Locataire — Documentation

## 🎯 Vue d'ensemble

Un système complet a été mis en place pour préparer le terrain pour la **fonctionnalité "Espace Locataire"** (tenant portal) sans la développer complètement pour le moment.

Le bouton est **grisé** avec une indication "Fonctionnalité à venir", mais l'infrastructure UI est prête pour la future implémentation.

---

## 📁 Fichiers Créés

### 1. `components/locataires/TenantPortalCard.tsx`
**Composant principal pour la page de détails locataire**

Affiche :
- ✅ Informations du locataire et du logement
- ✅ Statut d'activation (Activé / Non activé)
- ✅ Bouton "Activer l'espace locataire" (grisé, disabled)
- ✅ Message "Fonctionnalité à venir"
- ✅ Indicateur visuel du statut (radio button)
- ✅ Animations framer-motion

**Props :**
```typescript
{
  locataireName: string;      // Nom du locataire
  logementName: string;       // Nom du logement
  isActive?: boolean;         // Statut d'activation (défaut: false)
}
```

**Utilisé dans :** `app/(dashboard)/locataires/[id]/page.tsx`

---

### 2. `components/locataires/TenantPortalBadge.tsx`
**Petit badge réutilisable pour afficher le statut**

Versions :
- `size="sm"` — Badge compact pour listes
- `size="md"` — Badge moyen pour cartes

**Props :**
```typescript
{
  isActive?: boolean;         // Statut (défaut: false)
  size?: "sm" | "md";        // Taille (défaut: "sm")
}
```

**Peut être utilisé dans :**
- Liste des locataires
- Tableaux de synthèse
- Cartes compactes

---

### 3. `components/locataires/ContratDetailCard.tsx`
**Carte détaillée pour chaque contrat avec option espace locataire**

Affiche :
- ✅ Nom du logement et du locataire
- ✅ Statut du contrat (Actif, Terminé, Suspendu)
- ✅ Dates (début/fin)
- ✅ Loyer mensuel
- ✅ Bouton "Activer l'espace locataire" (grisé)
- ✅ Icônes et animations

**Props :**
```typescript
{
  logementName: string;       // Nom du logement
  statut: string;             // Statut du contrat
  dateDebut: string;          // Date de début (ISO)
  dateFin?: string | null;    // Date de fin (optional)
  loyerMensuel?: number;      // Loyer mensuel (optional)
  devise?: string;            // Devise (défaut: "FCFA")
  locataireName: string;      // Nom du locataire
}
```

**Utilisé dans :** `app/(dashboard)/locataires/[id]/page.tsx`

---

## 📝 Fichiers Modifiés

### `app/(dashboard)/locataires/[id]/page.tsx`
**Page de détails locataire**

**Changements :**
1. ✅ Import des 2 composants : `TenantPortalCard` + `ContratDetailCard`
2. ✅ Ajout de la `TenantPortalCard` si au moins un contrat actif existe
3. ✅ Remplacement de la liste simple par `ContratDetailCard` pour chaque contrat
4. ✅ Passage des informations manquantes (devise, loyer)

**Structure :**
```
Page Locataire
├─ Header + Info locataire
├─ Cards (Email, Téléphone, Date ajout)
├─ TenantPortalCard (Espace Locataire) ← NOUVEAU
├─ Liste "Contrats associés"
└─ ContratDetailCard pour chaque contrat ← AMÉLIORÉ
```

---

## 🔧 Architecture pour la Future Implémentation

### Base de Données (À ajouter quand la feature sera activée)

```sql
-- Colonnes à ajouter à la table 'locataires'
ALTER TABLE locataires ADD COLUMN IF NOT EXISTS espace_locataire_active BOOLEAN DEFAULT FALSE;
ALTER TABLE locataires ADD COLUMN IF NOT EXISTS espace_locataire_activated_at TIMESTAMP;

-- Optionnel : table pour stocker les identifiants de connexion locataire
CREATE TABLE IF NOT EXISTS tenant_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locataire_id UUID NOT NULL REFERENCES locataires(id),
  tenant_username VARCHAR(255) UNIQUE NOT NULL,
  tenant_password_hash VARCHAR(255) NOT NULL,
  activated_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Prochaines Étapes (Quand activer la feature)

1. **Backend**
   - Créer une nouvelle table `tenant_sessions` ou utiliser Supabase Auth
   - Implémenter API d'activation de l'espace
   - Créer un endpoint de connexion locataire

2. **Frontend**
   - Remplacer `disabled={true}` par logique d'activation
   - Implémenter modale d'activation
   - Créer `/tenant` route pour l'espace locataire
   - Ajouter navigation pour locataires connectés

3. **Sécurité**
   - Row-Level Security (RLS) pour `tenant_credentials`
   - Authentification séparée pour locataires
   - Rate limiting sur les tentatives de connexion

4. **UI Locataire**
   - Dashboard locataire (vue contrats, paiements, documents)
   - Formulaire de paiement en ligne
   - Galerie de logement, documents locataires
   - Messagerie propriétaire-locataire

---

## 🎨 Design & UX

### Couleurs Utilisées
- ✅ **Actif** : `success-*` (vert)
- ✅ **Non Actif** : `neutral-*` (gris)
- ✅ **Icônes** : `LockSimple`, `CircleNotch`, `CheckCircle` (Phosphor)

### Animations
- ✅ Framer-motion pour transitions smooth
- ✅ Hover/tap effects sur boutons (même grisés)
- ✅ Fade-in au chargement

### États du Bouton
```
Non activé (défaut) :
- Arrière-plan gris (neutral-100)
- Texte gris (neutral-400)
- Icône cadenas (lock)
- disabled={true}
- title="Fonctionnalité à venir"

Activé (futur) :
- Arrière-plan vert (success-100)
- Texte vert (success-700)
- Icône check (✓)
- disabled={false}
- Cliquable
```

---

## 📊 Workflow Futur

```
Utilisateur Propriétaire
└─ Clique sur "Activer l'espace locataire"
   └─ Modale d'activation (ou redirect)
      ├─ Génère credentials temporaires
      ├─ Envoie email au locataire
      └─ Marque espace_locataire_active = TRUE
   
   └─ Dashboard met à jour
      └─ Affiche TenantPortalCard avec isActive={true}
      └─ Bouton devient ✓ Espace activé

Locataire
└─ Reçoit email avec credentials
   └─ Navigue vers /tenant/login
   └─ Entre username/password
   └─ Redirigé vers /tenant/dashboard
   └─ Accès à :
      ├─ Mes contrats
      ├─ Mes paiements
      ├─ Payer mon loyer (stripe/paypal)
      ├─ Documents
      └─ Messagerie
```

---

## ✅ Checklist d'Intégration

Avant d'activer la feature :

- [ ] Ajouter colonnes à `locataires` (DB migration)
- [ ] Créer table `tenant_credentials` (optionnel)
- [ ] Implémenter API `/api/tenant/activate`
- [ ] Implémenter API `/api/tenant/login`
- [ ] Créer modale d'activation (ou page)
- [ ] Créer layout `/tenant` pour locataires
- [ ] Créer dashboard locataire
- [ ] Configurer RLS pour sécurité
- [ ] Tester flux complet
- [ ] Ajouter validation email
- [ ] Implémenter reset password pour locataire
- [ ] Ajouter logging/audit trail

---

## 🧪 Comment Tester Aujourd'hui

1. ✅ Accédez à une page locataire : `/locataires/[id]`
2. ✅ Vérifiez la section "Espace Locataire"
3. ✅ Le bouton doit être **grisé** avec tooltip "Fonctionnalité à venir"
4. ✅ Consultez les `ContratDetailCard` pour chaque contrat
5. ✅ Chaque carte doit afficher le bouton désactivé

---

## 📚 Imports Disponibles

```typescript
// Badge compact
import { TenantPortalBadge } from "@/components/locataires/TenantPortalBadge";
<TenantPortalBadge isActive={false} size="sm" />

// Card principale
import { TenantPortalCard } from "@/components/locataires/TenantPortalCard";
<TenantPortalCard 
  locataireName="Jean Dupont"
  logementName="Appartement A12"
  isActive={false}
/>

// Card détail contrat
import { ContratDetailCard } from "@/components/locataires/ContratDetailCard";
<ContratDetailCard 
  logementName="Appartement A12"
  statut="actif"
  dateDebut="2024-01-15"
  dateFin={null}
  loyerMensuel={150000}
  devise="FCFA"
  locataireName="Jean Dupont"
/>
```

---

## 🚀 Priorisation Future

**Phase 1 (MVP)** — À faire en premier :
1. DB migrations
2. API activation simple
3. Email notification
4. Activation button

**Phase 2** — Locataire login :
1. Auth page `/tenant/login`
2. Dashboard simple
3. Vue contrats/paiements

**Phase 3** — Paiements en ligne :
1. Intégration Stripe/Orange Money
2. Historique paiements
3. Reçus PDF

**Phase 4** — Enrichissement :
1. Messagerie
2. Document center
3. Notifications push

---

## 📌 Notes Importantes

⚠️ **Bouton intentionnellement grisé** — Ce n'est pas un bug, c'est par design pour préparer le terrain

⚠️ **Pas de fonctionnalité active pour le moment** — Juste la UI de préparation

✅ **Infrastructure prête** — Suffisamment d'espace pour ajouter la logique quand elle sera activée

✅ **Composants réutilisables** — Les 3 composants peuvent être utilisés ailleurs si besoin

✅ **Styles cohérents** — Suit le design system existant (Tailwind, Phosphor, Framer)

---

## 📞 Support

Pour activer la feature plus tard, référez-vous à cette doc et :
1. Consultez la section "Prochaines Étapes"
2. Suivez la "Checklist d'Intégration"
3. Utilisez le "Workflow Futur" comme guide

Le terrain est maintenant préparé ! 🎉
