# 🏪 Application de Gestion de Stock

Application web professionnelle de gestion de stock spécialement conçue pour une boutique de vêtements. Cette application permet la gestion complète des entrées et sorties de stock, le suivi des bénéfices, du chiffre d'affaires, et la génération de rapports financiers.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies Utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du Projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Captures d'Écran](#-captures-décran)
- [Maintenance](#-maintenance)

## ✨ Fonctionnalités

### Fonctionnalités Principales

1. **Gestion des Produits**
   - Ajout, modification et suppression de produits
   - Champs : nom, catégorie, quantité, prix d'achat, prix de vente, fournisseur
   - Recherche et filtrage par catégorie
   - Alertes de stock faible (< 10 unités)

2. **Gestion des Stocks**
   - Enregistrement des entrées de stock (nouveaux produits)
   - Enregistrement des sorties de stock (ventes)
   - Suivi en temps réel des quantités
   - Historique complet des mouvements

3. **Suivi Financier**
   - Calcul automatique des bénéfices par produit
   - Chiffre d'affaires total et par période
   - Valeur totale du stock
   - Marge unitaire sur chaque produit

4. **Tableau de Bord**
   - Vue d'ensemble des performances
   - Statistiques en temps réel
   - Graphiques de ventes
   - Graphiques de bénéfices par produit

5. **Rapports**
   - Rapports mensuels détaillés
   - Rapports annuels avec ventilation mensuelle
   - Exportation des données
   - Analyses par catégorie

6. **Interface Professionnelle**
   - Design moderne et ergonomique
   - Responsive (adapté mobile, tablette, desktop)
   - Navigation intuitive par onglets
   - Formulaires modaux pour saisie rapide

## 🛠 Technologies Utilisées

### Backend
- **Node.js** - Environnement d'exécution JavaScript
- **Express.js** - Framework web minimaliste
- **MySQL** - Base de données relationnelle
- **mysql2** - Driver MySQL pour Node.js

### Frontend
- **HTML5** - Structure
- **CSS3** - Stylisation moderne
- **JavaScript (Vanilla)** - Logique client
- **Chart.js** - Visualisations graphiques

### Outils
- **dotenv** - Gestion des variables d'environnement
- **cors** - Cross-Origin Resource Sharing
- **body-parser** - Parsing des requêtes HTTP

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 14.x ou supérieure)
  - [Télécharger Node.js](https://nodejs.org/)
- **MySQL** (version 5.7 ou supérieure)
  - [Télécharger MySQL](https://dev.mysql.com/downloads/)
- **npm** (installé avec Node.js)

Vérifiez les installations :
```bash
node --version
npm --version
mysql --version
```

## 🚀 Installation

### 1. Cloner le Projet

```bash
git clone https://github.com/onlinemarketbf-bot/stock-management.git
cd stock-management
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configuration de la Base de Données

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos paramètres MySQL :

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=stock_management
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Initialiser la Base de Données

```bash
npm run init-db
```

Cette commande va :
- Créer la base de données `stock_management`
- Créer les tables nécessaires (products, stock_movements, sales, users)
- Configurer les index pour les performances

### 5. Démarrer l'Application

**Mode développement** (avec rechargement automatique) :
```bash
npm run dev
```

**Mode production** :
```bash
npm start
```

L'application sera accessible à : **http://localhost:3000**

## ⚙️ Configuration

### Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DB_HOST` | Hôte MySQL | localhost |
| `DB_USER` | Utilisateur MySQL | root |
| `DB_PASSWORD` | Mot de passe MySQL | - |
| `DB_NAME` | Nom de la base de données | stock_management |
| `DB_PORT` | Port MySQL | 3306 |
| `PORT` | Port du serveur web | 3000 |
| `NODE_ENV` | Environnement | development |

### Structure de la Base de Données

#### Table `products`
Stocke les informations des produits.

| Colonne | Type | Description |
|---------|------|-------------|
| id | INT | Identifiant unique (auto-incrémenté) |
| name | VARCHAR(255) | Nom du produit |
| category | VARCHAR(100) | Catégorie |
| quantity | INT | Quantité en stock |
| purchase_price | DECIMAL(10,2) | Prix d'achat |
| selling_price | DECIMAL(10,2) | Prix de vente |
| supplier | VARCHAR(255) | Fournisseur |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

#### Table `stock_movements`
Enregistre tous les mouvements de stock.

| Colonne | Type | Description |
|---------|------|-------------|
| id | INT | Identifiant unique |
| product_id | INT | Référence au produit |
| movement_type | ENUM | 'entry' ou 'exit' |
| quantity | INT | Quantité |
| unit_price | DECIMAL(10,2) | Prix unitaire |
| total_amount | DECIMAL(10,2) | Montant total |
| note | TEXT | Note optionnelle |
| created_at | TIMESTAMP | Date du mouvement |

#### Table `sales`
Enregistre les ventes pour les analyses.

| Colonne | Type | Description |
|---------|------|-------------|
| id | INT | Identifiant unique |
| product_id | INT | Référence au produit |
| quantity | INT | Quantité vendue |
| unit_price | DECIMAL(10,2) | Prix unitaire |
| total_revenue | DECIMAL(10,2) | Chiffre d'affaires |
| total_profit | DECIMAL(10,2) | Bénéfice |
| sale_date | TIMESTAMP | Date de vente |

## 💻 Utilisation

### Tableau de Bord

Le tableau de bord affiche :
- Nombre total de produits
- Valeur totale du stock
- Chiffre d'affaires total
- Bénéfices totaux
- Nombre de produits en stock faible
- Graphique des ventes sur le mois
- Graphique des bénéfices par produit (Top 10)

### Gestion des Produits

1. **Ajouter un produit** : Cliquez sur "➕ Nouveau Produit"
2. **Modifier un produit** : Cliquez sur l'icône ✏️ dans la ligne du produit
3. **Supprimer un produit** : Cliquez sur l'icône 🗑️ (confirmation requise)
4. **Rechercher** : Utilisez la barre de recherche
5. **Filtrer** : Sélectionnez une catégorie dans le menu déroulant

### Mouvements de Stock

#### Entrée de Stock
1. Cliquez sur "📥 Entrée"
2. Sélectionnez le produit
3. Indiquez la quantité et le prix d'achat
4. Ajoutez une note optionnelle
5. Validez

#### Sortie de Stock (Vente)
1. Cliquez sur "📤 Sortie"
2. Sélectionnez le produit
3. Indiquez la quantité et le prix de vente
4. Le système vérifie automatiquement la disponibilité
5. Calcule automatiquement le bénéfice
6. Validez

### Rapports

#### Rapport Mensuel
1. Sélectionnez "Mensuel" comme type
2. Choisissez l'année et le mois
3. Cliquez sur "📊 Générer Rapport"
4. Visualisez les ventes, revenus et bénéfices du mois

#### Rapport Annuel
1. Sélectionnez "Annuel" comme type
2. Choisissez l'année
3. Cliquez sur "📊 Générer Rapport"
4. Visualisez la répartition mensuelle et par catégorie

## 📁 Structure du Projet

```
stock-management/
├── server/                    # Backend
│   ├── controllers/          # Logique métier
│   │   ├── productController.js
│   │   ├── stockController.js
│   │   └── reportController.js
│   ├── database/             # Configuration DB
│   │   ├── config.js
│   │   └── init.js
│   ├── routes/               # Routes API
│   │   ├── products.js
│   │   ├── stock.js
│   │   └── reports.js
│   └── index.js              # Serveur Express
├── public/                   # Frontend
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js           # Appels API
│   │   └── app.js           # Logique client
│   └── index.html           # Interface utilisateur
├── .env.example             # Template configuration
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Documentation

### Endpoints Produits

#### GET `/api/products`
Récupère tous les produits.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "T-shirt Bleu",
      "category": "T-shirts",
      "quantity": 50,
      "purchase_price": 5000,
      "selling_price": 8000,
      "supplier": "Fournisseur A"
    }
  ]
}
```

#### POST `/api/products`
Crée un nouveau produit.

**Body :**
```json
{
  "name": "T-shirt Bleu",
  "category": "T-shirts",
  "quantity": 50,
  "purchase_price": 5000,
  "selling_price": 8000,
  "supplier": "Fournisseur A"
}
```

#### PUT `/api/products/:id`
Met à jour un produit.

#### DELETE `/api/products/:id`
Supprime un produit.

### Endpoints Stock

#### POST `/api/stock/entry`
Enregistre une entrée de stock.

**Body :**
```json
{
  "product_id": 1,
  "quantity": 20,
  "unit_price": 5000,
  "note": "Nouvelle livraison"
}
```

#### POST `/api/stock/exit`
Enregistre une sortie de stock (vente).

**Body :**
```json
{
  "product_id": 1,
  "quantity": 5,
  "unit_price": 8000,
  "note": "Vente client"
}
```

#### GET `/api/stock/movements`
Récupère tous les mouvements.

### Endpoints Rapports

#### GET `/api/reports/dashboard`
Récupère les statistiques du tableau de bord.

#### GET `/api/reports/sales/:period`
Récupère les ventes par période (today, week, month, year).

#### GET `/api/reports/monthly/:year/:month`
Génère un rapport mensuel.

#### GET `/api/reports/annual/:year`
Génère un rapport annuel.

#### GET `/api/reports/profit-by-product`
Récupère les bénéfices par produit.

## 🖼 Captures d'Écran

L'interface comporte :
- Un tableau de bord avec statistiques et graphiques
- Une interface de gestion des produits avec tableau
- Un système de mouvements de stock
- Des formulaires modaux élégants
- Des rapports détaillés

## 🔧 Maintenance

### Sauvegarde de la Base de Données

```bash
mysqldump -u root -p stock_management > backup_$(date +%Y%m%d).sql
```

### Restauration

```bash
mysql -u root -p stock_management < backup_YYYYMMDD.sql
```

### Mise à Jour des Dépendances

```bash
npm update
```

### Logs

Les logs du serveur sont affichés dans la console. Pour une production, utilisez un gestionnaire de logs comme Winston ou Morgan.

## 🚀 Améliorations Futures

- [ ] Authentification et gestion des utilisateurs (admin/employé)
- [ ] Exportation des rapports en PDF/Excel
- [ ] Notifications par email pour stock faible
- [ ] Graphiques plus avancés avec filtres
- [ ] Impression de factures
- [ ] Gestion multi-magasins
- [ ] Application mobile (React Native)
- [ ] Prévisions de stock avec IA

## 📝 Licence

ISC

## 👥 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

---

**Développé avec ❤️ pour la gestion efficace des stocks de boutiques de vêtements**
