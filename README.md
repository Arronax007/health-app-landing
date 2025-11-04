# NutriSmart - Landing Page

## 📋 Description

Landing page pour **NutriSmart**, une application mobile de nutrition intelligente qui aide les utilisateurs à :
- 🍽️ Manger mieux, sans se priver
- 🧠 Comprendre les besoins de leur corps
- ⚖️ Retrouver l'équilibre entre plaisir, santé et performance

## 🎨 Design

- **Couleurs principales** : Gradient vert (#10B981) vers bleu (#3B82F6)
- **Typographie** : Inter (Google Fonts)
- **Layout** : Responsive (mobile-first)
- **Style** : Moderne, clean, axé santé et bien-être

## 📱 Fonctionnalités

### Landing Page
- Hero section avec gradient attractif
- 3 cartes de bénéfices principales
- Statistiques clés (100% personnalisé, 0€, 24/7)
- Formulaire d'inscription à la beta
- Mockup mobile interactif avec lightbox
- Design responsive

### Mockup Mobile
- Interface app complète avec :
  - Dashboard personnalisé
  - Suivi des repas quotidiens
  - Statistiques nutritionnelles
  - Suggestions intelligentes
  - Navigation bottom bar
  - Design iPhone moderne

## 🚀 Déploiement

### Prérequis
1. Prendre un screenshot du mockup mobile :
   - Ouvrir `mockup-mobile.html` dans un navigateur
   - Prendre un screenshot (idéalement 640x1386px pour une résolution 2x)
   - Sauvegarder comme `mockup-mobile.png`

### Déploiement sur Vercel

#### Via le site Vercel (Recommandé)
1. Créer un repository GitHub
2. Pousser le code :
```bash
git init
git add .
git commit -m "Initial commit: NutriSmart landing page"
git remote add origin https://github.com/VOTRE_USERNAME/nutrismart.git
git push -u origin main
```

3. Aller sur https://vercel.com
4. Importer le repository
5. Déployer (configuration automatique)

#### Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

## 📝 Formulaire - Intégration Google Sheets

### Configuration Google Apps Script

1. Créer un Google Sheet avec les colonnes :
   - Date
   - Nom complet
   - Email
   - Objectif
   - Consentement

2. Créer le script Apps Script :
```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads - NutriSmart');
    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.fullName,
      data.email,
      data.goal,
      data.consent ? 'Oui' : 'Non'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Inscription enregistrée'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Déployer comme Application Web (accès: Tout le monde)
4. Copier l'URL de déploiement
5. Remplacer `VOTRE_URL_ICI` dans `index.html` ligne ~420

## 🎯 Objectifs de conversion

- **Cible** : Personnes soucieuses de leur santé globale
- **Proposition de valeur** : Nutrition personnalisée sans privation
- **CTA principal** : Rejoindre la beta privée
- **Réassurance** : Gratuit, sans engagement

## 📊 Métriques à suivre

- Taux de visite → inscription
- Objectifs sélectionnés (insights utilisateurs)
- Taux d'ouverture du mockup (engagement)
- Sources de trafic

## 🔧 Personnalisation

### Modifier les couleurs
Dans `index.html`, chercher et remplacer :
- `#10B981` (vert) → votre couleur primaire
- `#3B82F6` (bleu) → votre couleur secondaire

### Modifier le contenu
Tous les textes sont dans `index.html` et facilement modifiables.

### Ajouter Google Analytics
Ajouter avant `</head>` :
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## 📁 Structure des fichiers

```
Heath app/
├── index.html              # Landing page principale
├── mockup-mobile.html      # Mockup de l'app mobile
├── mockup-mobile.png       # Screenshot du mockup (à créer)
├── vercel.json            # Configuration Vercel
├── .gitignore             # Fichiers Git à ignorer
└── README.md              # Ce fichier
```

## 🆘 Support

Pour toute question : alexandre.petit.qin@gmail.com

## 📄 License

© 2025 NutriSmart - Tous droits réservés
