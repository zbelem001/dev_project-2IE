# Intégration des Données de Login au Profil Utilisateur

## Vue d'ensemble

Ce document décrit les modifications apportées pour faire correspondre les données de log dans la page de connexion au profil utilisateur dans la page de profil, en utilisant la structure réelle de la table `utilisateurs` et en récupérant les données dynamiquement depuis la base de données.

## Structure de la Table Utilisateurs

```sql
CREATE TABLE utilisateurs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  useractive TINYINT(1) DEFAULT 1
);
```

## Modifications Apportées

### 1. Backend (API)

#### `back-end/middleware/userLoginCheck.js`
- **Modification** : Ajout de champs supplémentaires dans la réponse de l'API de connexion
- **Nouveaux champs** : `nom`, `prenom`, `telephone`, `date_creation`
- **Objectif** : Retourner les informations complètes de l'utilisateur lors de la connexion

#### `back-end/middleware/Data/Utilisateur.js`
- **Modification** : Refactorisation pour récupérer les données d'un utilisateur spécifique
- **Colonnes récupérées** : `id`, `nom`, `prenom`, `email`, `telephone`, `date_creation`, `useractive`
- **Sécurité** : Vérification que l'utilisateur est actif (`useractive = 1`)

#### `back-end/middleware/Data/Dashboard.js` (Nouveau)
- **Fonctionnalité** : API pour récupérer les données complètes du dashboard
- **Données récupérées** :
  - Informations utilisateur (nom, prénom, email, téléphone, date de création)
  - Livres empruntés (si table `emprunts` existe)
  - Historique des emprunts (si table `emprunts` existe)
- **Gestion d'erreur** : Retourne des données vides si les tables d'emprunts n'existent pas

#### `back-end/server.js`
- **Ajout** : Nouvelles routes protégées
  - `/api/profile` : Récupération du profil utilisateur
  - `/api/dashboard` : Récupération des données du dashboard
- **Protection** : Routes protégées par le middleware `verifyToken`

### 2. Frontend (React/Next.js)

#### `font-end/src/components/AuthContext.tsx`
- **Fonctionnalité** : Contexte d'authentification centralisé avec récupération dynamique
- **Interface User** : Mise à jour pour correspondre aux vraies colonnes
- **Nouvelles méthodes** :
  - `refreshUserData()` : Récupère les données utilisateur depuis l'API
  - `fetchUserData()` : Fonction interne pour les appels API
- **Comportement** : Rafraîchit automatiquement les données au chargement

#### `font-end/src/components/ProtectedRoute.tsx`
- **Fonctionnalité** : Protection des routes nécessitant une authentification
- **Comportement** : Redirection automatique vers `/login` si non connecté
- **Affichage** : Indicateur de chargement pendant la vérification

#### `font-end/src/app/layout.tsx`
- **Modification** : Ajout du `AuthProvider` pour wrapper l'application
- **Mise à jour** : Métadonnées de l'application

#### `font-end/src/app/login/page.tsx`
- **Modification** : Utilisation du contexte d'authentification
- **Stockage** : Données utilisateur stockées via `login()` du contexte
- **Champs** : `nom`, `prenom`, `email`, `telephone`, `date_creation`

#### `font-end/src/app/profil/page.tsx`
- **Refactorisation** : Suppression des données mock
- **Intégration** : Utilisation du contexte d'authentification avec récupération API
- **Protection** : Enveloppement avec `ProtectedRoute`
- **Fonctionnalités** :
  - Récupération des données depuis l'API au chargement
  - Affichage du nom complet (nom + prénom)
  - Formulaire d'édition avec validation
  - Affichage de la date de création formatée
  - Gestion du téléphone optionnel
  - Gestion de la déconnexion
  - Gestion des erreurs et états de chargement

#### `font-end/src/app/dashbord/page.tsx`
- **Refactorisation complète** : Suppression des données mock
- **Intégration API** : Récupération des données depuis `/api/dashboard`
- **Protection** : Enveloppement avec `ProtectedRoute`
- **Fonctionnalités** :
  - Récupération dynamique des données utilisateur
  - Affichage des livres empruntés depuis la base de données
  - Historique des emprunts depuis la base de données
  - Gestion des états de chargement et d'erreur
  - Formatage des dates en français
  - Recherche dans les livres empruntés
  - Gestion des cas où aucune donnée n'est disponible

## Flux de Données

### 1. Connexion
```
Login Form → API /userlogin → AuthContext.login() → localStorage + state
```

### 2. Accès au Profil
```
ProtectedRoute → AuthContext.refreshUserData() → API /api/profile → Affichage
```

### 3. Accès au Dashboard
```
ProtectedRoute → API /api/dashboard → Affichage des données complètes
```

### 4. Mise à Jour du Profil
```
Form Submit → AuthContext.updateUser() → AuthContext.refreshUserData() → localStorage + state
```

## Sécurité

- **Tokens JWT** : Authentification sécurisée
- **Middleware** : Vérification des tokens côté serveur
- **Protection des routes** : Accès contrôlé aux pages protégées
- **Validation** : Vérification des données côté client et serveur
- **Statut utilisateur** : Vérification que `useractive = 1`
- **Gestion d'erreur** : Gestion gracieuse des erreurs API

## Structure des Données

### Interface User
```typescript
interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  date_creation?: string;
  useractive?: number;
}
```

### Interface DashboardData
```typescript
interface DashboardData {
  user: DashboardUser;
  borrowedBooks: Book[];
  borrowingHistory: BorrowingHistory[];
}
```

## Points d'API

### Connexion
- **URL** : `POST /userlogin`
- **Réponse** : Token + données utilisateur (id, email, nom, prenom, telephone, date_creation)

### Profil Utilisateur
- **URL** : `GET /api/profile`
- **Headers** : `Authorization: Bearer <token>`
- **Réponse** : Données complètes de l'utilisateur connecté

### Dashboard
- **URL** : `GET /api/dashboard`
- **Headers** : `Authorization: Bearer <token>`
- **Réponse** : Données utilisateur + emprunts + historique

## Fonctionnalités Avancées

### Récupération Dynamique
- **Rafraîchissement automatique** : Les données sont récupérées depuis l'API au chargement
- **Gestion d'erreur** : Affichage d'erreurs et boutons de retry
- **États de chargement** : Indicateurs visuels pendant les requêtes
- **Fallback** : Utilisation des données locales en cas d'échec API

### Gestion des Données
- **Formatage des dates** : Affichage en français avec formatage approprié
- **Validation** : Vérification des données côté client et serveur
- **Recherche** : Fonctionnalité de recherche dans les livres empruntés
- **Responsive** : Interface adaptée aux différentes tailles d'écran

## Utilisation

1. **Connexion** : L'utilisateur se connecte via `/login`
2. **Stockage initial** : Les données sont stockées dans le contexte
3. **Récupération dynamique** : Les données sont récupérées depuis l'API
4. **Affichage** : Les pages affichent les données réelles de la base
5. **Mise à jour** : Les modifications sont synchronisées avec l'API
6. **Déconnexion** : Nettoyage automatique des données

## Avantages

- **Données réelles** : Utilisation des vraies données de la base
- **Performance** : Récupération optimisée des données
- **Sécurité** : Protection complète des routes et données
- **UX** : Expérience utilisateur fluide avec gestion d'erreur
- **Maintenabilité** : Code modulaire et réutilisable
- **Évolutivité** : Structure prête pour l'ajout de nouvelles fonctionnalités
- **Robustesse** : Gestion gracieuse des erreurs et cas limites 