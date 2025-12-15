# 📦 Stock Management - Gestion de Stock

Application web de gestion de stock pour une boutique de vêtements.

## 🌟 Fonctionnalités

- ✅ Ajouter des articles au stock
- ✏️ Modifier les articles existants
- 🗑️ Supprimer des articles
- 🔍 Rechercher des articles
- 📊 Statistiques en temps réel (total articles, stock, valeur)
- 💾 Sauvegarde automatique des données (localStorage)
- 📱 Interface responsive (mobile, tablette, desktop)
- ⚠️ Alertes visuelles pour stock faible ou épuisé
- 🎨 Interface moderne et intuitive

## 🚀 Installation

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Aucun serveur requis

### Lancement
1. Clonez le repository :
```bash
git clone https://github.com/onlinemarketbf-bot/stock-management.git
cd stock-management
```

2. Ouvrez le fichier `index.html` dans votre navigateur web :
   - Double-cliquez sur `index.html`, ou
   - Clic droit → Ouvrir avec → Votre navigateur préféré, ou
   - Glissez-déposez le fichier dans votre navigateur

L'application est maintenant prête à l'emploi !

## 📖 Utilisation

### Ajouter un article
1. Remplissez le formulaire à gauche avec les informations de l'article :
   - Nom de l'article (ex: T-shirt Nike)
   - Catégorie (T-shirts, Pantalons, Robes, etc.)
   - Taille (XS, S, M, L, XL, XXL)
   - Quantité en stock
   - Prix en FCFA
   - Couleur (optionnel)
2. Cliquez sur "Ajouter"

### Modifier un article
1. Cliquez sur le bouton "Modifier" de l'article dans le tableau
2. Les informations seront chargées dans le formulaire
3. Modifiez les champs souhaités
4. Cliquez sur "Modifier" pour sauvegarder

### Supprimer un article
1. Cliquez sur le bouton "Supprimer" de l'article
2. Confirmez la suppression

### Rechercher un article
Utilisez la barre de recherche en haut du tableau pour filtrer les articles par nom, catégorie, taille ou couleur.

## 🎨 Fonctionnalités visuelles

- **Carte verte** : Stock normal
- **Carte jaune** : Stock faible (< 5 articles)
- **Carte rouge** : Stock épuisé (0 articles)

## 💾 Données

Les données sont automatiquement sauvegardées dans le navigateur (localStorage) et persistent entre les sessions. Pour réinitialiser les données, effacez le cache du navigateur.

## 🛠️ Technologies utilisées

- HTML5
- CSS3 (avec Flexbox et Grid)
- JavaScript (ES6+)
- LocalStorage API

## 📁 Structure du projet

```
stock-management/
├── index.html      # Page principale de l'application
├── styles.css      # Styles et mise en page
├── app.js          # Logique de l'application
└── README.md       # Documentation
```

## 🌐 Compatibilité

- ✅ Chrome (dernière version)
- ✅ Firefox (dernière version)
- ✅ Safari (dernière version)
- ✅ Edge (dernière version)
- ✅ Responsive design pour mobile et tablette

## 📝 Licence

Ce projet est sous licence MIT.

## 👥 Auteur

OnlineMarketBF - Gestion de boutique en ligne

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou un pull request.
