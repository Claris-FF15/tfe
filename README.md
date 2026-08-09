# BadgeApp

Système de gestion des accès et badges pour la sécurité d'entreprise — TFE. Version 1 de  l'application.

BadgeApp permet de gérer les utilisateurs, les badges RFID, les zones/portes d'un bâtiment, et de tracer en temps réel les tentatives d'accès (autorisées ou refusées). Le système détecte automatiquement les comportements suspects (accès refusés répétés) et désactive le compte concerné.

## Fonctionnalités

- **Authentification** par JWT, avec rôles `admin`, `responsable_securite` et `user`
- **Gestion des utilisateurs** : création, modification, activation/désactivation, changement de rôle (réservé au responsable sécurité)
- **Gestion des badges** : création, assignation/réassignation à un utilisateur, activation/désactivation, historique des activités
- **Zones et portes** : création de zones, ajout de portes, gestion des permissions d'accès par utilisateur
- **Zone Serveur restreinte** : seuls les rôles `admin` et `responsable_securite` peuvent obtenir un accès à cette zone
- **Journal d'activité** : historique complet des accès (autorisés/refusés), page dédiée aux incidents (accès refusés uniquement)
- **Sécurité automatique** : désactivation automatique d'un utilisateur après 3 accès refusés en moins de 10 minutes, avec notification affichée sur toute l'application
- **Profil utilisateur** : modification du nom et du mot de passe

## Stack technique

**Backend**
- FastAPI (Python 3.11)
- PostgreSQL + SQLAlchemy
- JWT (python-jose) pour l'authentification
- Passlib / bcrypt pour le hachage des mots de passe

**Frontend**
- Angular 21 (standalone components)
- ag-Grid pour les tableaux de données
- SCSS/SASS

**Infrastructure**
- Docker / Docker Compose
- pgAdmin pour l'administration de la base de données

## Prérequis

- Docker et Docker Compose
- Node.js (pour le développement frontend hors conteneur, si besoin)

## Installation

1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd BadgeApp
```

2. Configurer les variables d'environnement du backend (fichier `.env` dans `app/`)

```
JWT_SECRET_KEY=<votre_clé_secrète>
DATABASE_URL=postgresql+psycopg2://postgres:@db:5432/badge_app
```

3. Lancer l'application avec Docker Compose

```bash
cd tools
docker compose up --build
```

## Accès

| Service | URL |
|---|---|
| Frontend (Angular) | http://localhost:4200 |
| Backend (API FastAPI) | http://localhost:8000 |
| Documentation API (Swagger) | http://localhost:8000/docs |
| pgAdmin | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

## Structure du projet

```
BadgeApp/
├── app/                    # Backend FastAPI
│   ├── main.py
│   ├── models/              # Modèles SQLAlchemy
│   ├── schemas/              # Schémas Pydantic
│   ├── repositories/          # Accès aux données
│   ├── services/              # Logique métier
│   ├── routers/               # Routes API
│   └── dependencies/           # Dépendances (auth, permissions)
├── web/                    # Frontend Angular
│   └── src/app/
│       ├── login/
│       ├── profile/
│       ├── users/
│       ├── badges/
│       ├── zones/
│       ├── activities/
│       └── services/
└── tools/                  # Outils d'infrastructure
    └── docker-compose.yml
```

## Rôles et permissions

| Action | user | admin | responsable_securite |
|---|:---:|:---:|:---:|
| Se connecter à l'application | ❌ | ✅ | ✅ |
| Consulter les utilisateurs, badges, zones | ❌ | ✅ | ✅ |
| Créer un utilisateur avec le rôle `user` | ❌ | ✅ | ✅ |
| Créer un utilisateur `admin` / `responsable_securite` | ❌ | ❌ | ✅ |
| Modifier son propre profil | ❌ | ✅ | ✅ |
| Modifier un autre utilisateur `user` | ❌ | ✅ | ✅ |
| Modifier un autre `admin` | ❌ | ❌ | ✅ |
| Changer le rôle d'un utilisateur | ❌ | ❌ | ✅ |
| Attribuer un accès à la zone Serveur | ❌ | ✅ (soi-même) | ✅ |

## CI/CD

Deux workflows GitHub Actions vérifient la compilation du backend et du frontend à chaque push/PR touchant leurs dossiers respectifs (`app/` et `web/`).

## Roadmap / améliorations possibles

- Écriture des tests unitaires et d'intégration (backend et frontend)
- Passage des mots de passe optionnels vers une gestion plus fine des comptes sans accès applicatif
- Notifications en temps réel (WebSocket) plutôt que par polling
- Journal d'actions (audit log) des opérations effectuées sur les badges, zones, users pour une traçabilité renforcée
- Badges éphémères / temporaires pour les visiteurs, avec une durée de validité courte et un accès limité
- Page de gestion des permissions par groupe (gérée par le responsable sécurité) : définir des groupes d'utilisateurs avec un accès par défaut à certaines zones et un refus par défaut aux autres
- Thème clair ou personnalisable, en plus du thème sombre actuel

## Auteur

Projet réalisé dans le cadre d'un Travail de Fin d'Études (TFE).