# Stock Management - Application de Gestion de Stock

Application web complète de gestion de stock pour une boutique de vêtements.

## 📋 Fonctionnalités

- **Tableau de bord** : Vue d'ensemble avec statistiques en temps réel
  - Nombre total de produits
  - Quantité totale en stock
  - Alertes de stock faible
  - Valeur totale du stock
  - Activité récente

- **Gestion des produits** :
  - Ajouter, modifier et supprimer des produits
  - Informations : nom, référence, catégorie, prix, quantité, stock minimum
  - Suivi des niveaux de stock
  - Alertes automatiques pour stock faible

- **Gestion des catégories** :
  - Créer et gérer des catégories de produits
  - Organisation hiérarchique des produits

- **Mouvements de stock** :
  - Enregistrement des entrées (réapprovisionnement)
  - Enregistrement des sorties (ventes, retraits)
  - Historique complet des mouvements
  - Traçabilité avec utilisateur et motif

- **Alertes** :
  - Notification des produits en stock faible
  - Réapprovisionnement rapide depuis les alertes

## 🚀 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Installation locale

1. Cloner le repository :
```bash
git clone https://github.com/onlinemarketbf-bot/stock-management.git
cd stock-management
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer l'application :
```bash
npm start
```

4. Ouvrir votre navigateur à l'adresse :
```
http://localhost:3000
```

## 🐳 Déploiement avec Docker

### Construction de l'image
```bash
docker build -t stock-management .
```

### Lancement du conteneur
```bash
docker run -p 3000:3000 -v $(pwd)/data:/app stock-management
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
stock-management/
├── server.js           # Serveur Express et API REST
├── public/             # Frontend
│   ├── index.html     # Interface utilisateur
│   ├── styles.css     # Styles CSS
│   └── app.js         # Logique JavaScript
├── package.json        # Dépendances Node.js
├── Dockerfile          # Configuration Docker
└── README.md          # Documentation
```

## 🔧 Technologies utilisées

### Backend
- **Node.js** - Environnement d'exécution JavaScript
- **Express** - Framework web
- **SQLite3** - Base de données légère
- **CORS** - Gestion des requêtes cross-origin

### Frontend
- **HTML5** - Structure
- **CSS3** - Styles et design responsive
- **JavaScript (Vanilla)** - Logique client
- **Fetch API** - Communication avec l'API

## 📊 Base de données

L'application utilise SQLite avec 3 tables principales :

### Categories
- id (PRIMARY KEY)
- name
- description
- created_at

### Products
- id (PRIMARY KEY)
- name
- reference (UNIQUE)
- category_id (FOREIGN KEY)
- description
- price
- quantity
- min_stock
- image_url
- created_at
- updated_at

### Stock_movements
- id (PRIMARY KEY)
- product_id (FOREIGN KEY)
- type (IN/OUT)
- quantity
- reason
- user
- created_at

## 🔌 API Endpoints

### Categories
- `GET /api/categories` - Liste toutes les catégories
- `POST /api/categories` - Crée une nouvelle catégorie
- `DELETE /api/categories/:id` - Supprime une catégorie

### Products
- `GET /api/products` - Liste tous les produits
- `GET /api/products/:id` - Récupère un produit
- `POST /api/products` - Crée un nouveau produit
- `PUT /api/products/:id` - Met à jour un produit
- `DELETE /api/products/:id` - Supprime un produit

### Movements
- `GET /api/movements` - Liste tous les mouvements
- `GET /api/movements/:productId` - Mouvements d'un produit
- `POST /api/movements` - Enregistre un mouvement

### Dashboard & Alerts
- `GET /api/dashboard/stats` - Statistiques du tableau de bord
- `GET /api/alerts/low-stock` - Produits en stock faible

## 🎨 Interface utilisateur

L'interface est entièrement responsive et adaptée aux écrans mobiles et tablettes :
- Design moderne et épuré
- Navigation intuitive via sidebar
- Formulaires modaux pour les actions CRUD
- Tableaux interactifs avec actions rapides
- Badges colorés pour les statuts
- Indicateurs visuels pour le stock faible

## 🔐 Sécurité

- Validation des données côté serveur
- Transactions SQL pour les mouvements de stock
- Protection contre les injections SQL via paramètres préparés
- CORS configuré pour la sécurité

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📝 Licence

ISC

## 👥 Auteur

OnlineMarketBF

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.
