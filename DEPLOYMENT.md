# Guide de déploiement - NutriSmart

## 📦 Push vers GitHub

### 1. Créer le screenshot du mockup (IMPORTANT)

Avant de committer, créer l'image du mockup :
1. Ouvrir `mockup-mobile.html` dans un navigateur
2. Prendre un screenshot haute résolution
3. Sauvegarder comme `mockup-mobile.png` dans le dossier

### 2. Initialiser et pousser vers GitHub

```powershell
# Se placer dans le dossier (avec apostrophes pour les espaces)
cd 'c:\Dev\SaaS\Heath app'

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit: NutriSmart landing page"

# Lier au repository GitHub
git remote add origin https://github.com/Arronax007/health-app-landing.git

# Renommer la branche en main
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

## 🚀 Déploiement sur Vercel

### Option A : Via le site Vercel (Recommandé)

1. Aller sur https://vercel.com
2. Se connecter avec GitHub
3. Cliquer sur **"Add New Project"**
4. Importer : `Arronax007/health-app-landing`
5. Configuration :
   - **Framework Preset** : Other
   - **Root Directory** : `./`
   - **Build Command** : (laisser vide)
   - **Output Directory** : (laisser vide)
6. Cliquer sur **"Deploy"**
7. Attendre 1-2 minutes
8. Site disponible sur : `https://health-app-landing.vercel.app`

### Option B : Via Vercel CLI

```powershell
# Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Pour la production
vercel --prod
```

## 📝 Configuration Google Sheets (Optionnel)

Si tu veux connecter le formulaire à Google Sheets :

### 1. Créer le Google Sheet

1. Créer un nouveau Google Sheet
2. Nommer la feuille : `Leads - NutriSmart`
3. Ajouter les en-têtes (ligne 1) :
   - A1 : `Date`
   - B1 : `Nom complet`
   - C1 : `Email`
   - D1 : `Objectif`
   - E1 : `Consentement`

### 2. Créer le script Apps Script

1. Dans Google Sheets : **Extensions > Apps Script**
2. Copier-coller ce code :

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads - NutriSmart');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Feuille non trouvée'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
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

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'API active'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Enregistrer le projet : "NutriSmart API"

### 3. Déployer l'API

1. **Déployer > Nouveau déploiement**
2. Type : **Application Web**
3. Configuration :
   - **Exécuter en tant que** : Moi
   - **Qui a accès** : Tout le monde
4. **Déployer** et autoriser
5. **Copier l'URL** (format : `https://script.google.com/macros/s/.../exec`)

### 4. Mettre à jour index.html

1. Ouvrir `index.html`
2. Chercher ligne ~420 : `const GOOGLE_SCRIPT_URL = 'VOTRE_URL_ICI';`
3. Remplacer par l'URL copiée
4. Sauvegarder et pousser :

```powershell
git add index.html
git commit -m "Add Google Sheets integration"
git push
```

Vercel redéploiera automatiquement !

## ✅ Vérification post-déploiement

Tester :
- [ ] La page s'affiche correctement
- [ ] Le mockup mobile s'affiche
- [ ] Le zoom sur le mockup fonctionne
- [ ] Le formulaire s'envoie
- [ ] Les données arrivent dans Google Sheets (si configuré)
- [ ] Responsive mobile/tablet/desktop

## 🔄 Mises à jour futures

```powershell
# Faire les modifications
git add .
git commit -m "Description des changements"
git push

# Vercel déploie automatiquement
```

## 🎨 Personnalisation rapide

### Changer le nom de l'app
Chercher et remplacer "NutriSmart" dans `index.html`

### Changer les couleurs
Remplacer dans `index.html` :
- `#10B981` → votre vert
- `#3B82F6` → votre bleu

### Modifier les bénéfices
Éditer les 3 cartes `.benefit-card` dans `index.html`

## 📊 Analytics (Optionnel)

### Vercel Analytics
1. Dashboard Vercel > Projet > Analytics
2. Enable (gratuit jusqu'à 100k événements/mois)

### Google Analytics
Ajouter avant `</head>` dans `index.html` :
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## 🆘 Support

Questions : alexandre.petit.qin@gmail.com

## 🔗 Liens utiles

- Repository : https://github.com/Arronax007/health-app-landing
- Vercel Dashboard : https://vercel.com/dashboard
- Documentation Vercel : https://vercel.com/docs
