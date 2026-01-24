# 📊 Guide d'intégration des Metrics - Health App

## 🎯 Vue d'ensemble
Système de tracking des visites via Google Sheets existant, totalement invisible pour les visiteurs.

---

## 📋 ÉTAPE 1 : Configuration Google Sheets

### 1.1 Créer l'onglet "Metrics"
Dans votre Google Sheet actuel (celui connecté au Google Apps Script), ajoutez un nouvel onglet nommé **`Metrics`**

### 1.2 Structure des colonnes (ligne 1)

| A | B | C | D | E |
|---|---|---|---|---|
| **Timestamp** | **Pays** | **Langue** | **Referrer** | **User-Agent** |

**Important :** La ligne 1 doit contenir ces en-têtes exactement.

### 1.3 Créer l'onglet "Stats_Quotidiennes"
Créez un second onglet nommé **`Stats_Quotidiennes`** avec cette structure :

| A | B |
|---|---|
| **Date** | **Visites** |

**Note :** Cet onglet affichera automatiquement le nombre de visites par jour.

---

## 📝 ÉTAPE 2 : Google Apps Script

### 2.1 Accéder au script
1. Ouvrez votre Google Sheet
2. Menu **Extensions** → **Apps Script**
3. Vous devriez voir votre script existant pour la waitlist

### 2.2 Remplacer le code

⚠️ **IMPORTANT :** Le code ci-dessous **fusionne** vos fonctionnalités existantes (waitlist + emails) avec le nouveau système de tracking.

**Toutes vos fonctionnalités actuelles sont conservées :**
- ✅ Inscription à la waitlist
- ✅ Envoi d'email de bienvenue automatique
- ✅ Fonction `sendWelcomeEmailToAll()`
- ✅ Fonction `testSingleEmail()`
- ✅ Compteur d'utilisateurs (GET)

**Nouvelles fonctionnalités ajoutées :**
- ✅ Tracking des visites (onglet Metrics)
- ✅ Stats quotidiennes automatiques (onglet Stats_Quotidiennes)

Le code complet est disponible dans le fichier `google-apps-script-complet.js` de votre projet.

Copiez-collez ce code complet :

```javascript
// Configuration
const SHEET_NAME = 'Waitlist';
const METRICS_SHEET_NAME = 'Metrics';
const STATS_SHEET_NAME = 'Stats_Quotidiennes';

// ============================================
// FONCTION PRINCIPALE - Gestion des requêtes
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Si c'est une inscription waitlist
    if (data.fullName && data.email) {
      return handleWaitlistSignup(data);
    }
    
    // Si c'est un tracking de visite
    if (data.type === 'pageview') {
      return handlePageView(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Type de requête non reconnu'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const userCount = data.length - 1; // Minus header row
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      userCount: userCount
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// WAITLIST - Gestion des inscriptions
// ============================================

function handleWaitlistSignup(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  // Ajouter la ligne
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
}

// ============================================
// METRICS - Tracking des visites
// ============================================

function handlePageView(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(METRICS_SHEET_NAME);
  
  // Détecter le pays via l'IP (approximatif)
  const country = detectCountry(data.userAgent, data.language);
  
  // Ajouter la visite
  sheet.appendRow([
    new Date(),
    country,
    data.language || 'fr',
    data.referrer || 'Direct',
    detectDeviceType(data.userAgent),
    data.page || 'index.html'
  ]);
  
  // Mettre à jour les stats quotidiennes
  updateDailyStats();
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Visite enregistrée'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// UTILITAIRES
// ============================================

function detectCountry(userAgent, language) {
  // Détection basique via la langue du navigateur
  if (!language) return 'Inconnu';
  
  const langMap = {
    'fr': 'France',
    'fr-FR': 'France',
    'fr-CH': 'Suisse',
    'fr-BE': 'Belgique',
    'fr-CA': 'Canada',
    'en': 'USA',
    'en-US': 'USA',
    'en-GB': 'UK',
    'en-CA': 'Canada',
    'de': 'Allemagne',
    'de-CH': 'Suisse',
    'it': 'Italie',
    'es': 'Espagne'
  };
  
  return langMap[language] || language.split('-')[0].toUpperCase();
}

function detectDeviceType(userAgent) {
  if (!userAgent) return 'Inconnu';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'Tablette';
  } else {
    return 'Desktop';
  }
}

function updateDailyStats() {
  const metricsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(METRICS_SHEET_NAME);
  const statsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STATS_SHEET_NAME);
  
  // Récupérer toutes les visites
  const metricsData = metricsSheet.getDataRange().getValues();
  
  // Ignorer la ligne d'en-tête
  if (metricsData.length <= 1) return;
  
  // Compter les visites par jour
  const visitsByDay = {};
  
  for (let i = 1; i < metricsData.length; i++) {
    const timestamp = metricsData[i][0];
    if (timestamp instanceof Date) {
      const dateStr = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      visitsByDay[dateStr] = (visitsByDay[dateStr] || 0) + 1;
    }
  }
  
  // Effacer les anciennes stats (garder la ligne d'en-tête)
  if (statsSheet.getLastRow() > 1) {
    statsSheet.deleteRows(2, statsSheet.getLastRow() - 1);
  }
  
  // Ajouter les nouvelles stats triées par date
  const sortedDates = Object.keys(visitsByDay).sort().reverse(); // Plus récent en premier
  
  sortedDates.forEach(date => {
    statsSheet.appendRow([date, visitsByDay[date]]);
  });
}
```

### 2.3 Déployer le script
1. Cliquez sur **Déployer** → **Nouveau déploiement**
2. Type : **Application Web**
3. Exécuter en tant que : **Moi**
4. Qui peut accéder : **Tout le monde**
5. Cliquez sur **Déployer**
6. **Copiez l'URL** générée (vous en aurez besoin pour le HTML)

---

## 🌐 ÉTAPE 3 : Modification du code HTML

Le code sera automatiquement ajouté à votre `index.html` par Cascade.

---

## 📊 Utilisation

### Voir les metrics

#### Onglet "Metrics"
- Toutes les visites individuelles avec détails
- Export Excel : **Fichier** → **Télécharger** → **Microsoft Excel (.xlsx)**

#### Onglet "Stats_Quotidiennes"
- Compteur automatique par jour
- Mise à jour en temps réel

### Données trackées
- ✅ Nombre de visites
- ✅ Pays (détecté via langue navigateur)
- ✅ Langue (fr/en)
- ✅ Page de provenance (referrer)
- ✅ Type d'appareil (mobile/desktop/tablette)
- ✅ Timestamp précis

### Confidentialité
- ❌ Pas d'IP stockée (respect RGPD)
- ❌ Pas de cookies
- ❌ Invisible pour les visiteurs
- ✅ Données anonymisées

---

## ⚠️ Important

1. **Garder l'URL du script secrète** (ne pas la partager publiquement)
2. **Vérifier que les onglets sont bien nommés** : `Metrics` et `Stats_Quotidiennes`
3. **Tester avec une visite** pour vérifier que tout fonctionne

---

## 🔧 Dépannage

### Problème : Aucune visite enregistrée
- Vérifiez que l'URL du script est correcte dans `index.html`
- Vérifiez que le déploiement est actif
- Vérifiez la console du navigateur (F12) pour les erreurs

### Problème : Stats quotidiennes vides
- L'onglet se met à jour automatiquement après chaque visite
- Si vide, vérifiez que l'onglet s'appelle exactement `Stats_Quotidiennes`

### Problème : Pays = "Inconnu"
- Normal si le navigateur ne partage pas sa langue
- Alternative : utiliser une API de géolocalisation (payante)

---

## 📈 Améliorations possibles

- Ajouter un dashboard visuel avec Google Data Studio
- Intégrer une vraie API de géolocalisation par IP
- Ajouter des graphiques dans Google Sheets
- Exporter automatiquement vers Excel chaque semaine

