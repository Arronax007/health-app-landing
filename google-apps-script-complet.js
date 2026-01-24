// ============================================
// 📋 CONFIGURATION
// ============================================

// Feuilles Google Sheets
const SHEET_NAME = 'Leads - Health App';
const METRICS_SHEET_NAME = 'Metrics';
const STATS_SHEET_NAME = 'Stats_Quotidiennes';

// Configuration email
const FROM_NAME = 'Votre compagnon nutrition';
const REPLY_TO = 'jennyvgrimm@gmail.com';

// ============================================
// 🌐 GESTION DES REQUÊTES (POST)
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // ✅ Si c'est une inscription waitlist (a les champs fullName + email)
    if (data.fullName && data.email) {
      return handleWaitlistSignup(data);
    }
    
    // 📊 Si c'est un tracking de visite (a le champ type = 'pageview')
    if (data.type === 'pageview') {
      return handlePageView(data);
    }
    
    // Type de requête non reconnu
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

// ============================================
// 📈 COMPTEUR D'UTILISATEURS (GET)
// ============================================

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Feuille non trouvée'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const lastRow = sheet.getLastRow();
    const userCount = Math.max(0, lastRow - 1);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      userCount: userCount,
      message: 'Compte obtenu'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// ✅ WAITLIST - Gestion des inscriptions
// ============================================

function handleWaitlistSignup(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Feuille non trouvée'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Ajout dans la feuille
  sheet.appendRow([
    new Date(),           // Timestamp
    data.fullName,
    data.email,
    data.goal,
    data.consent ? 'Oui' : 'Non'
  ]);

  // Envoi de l'email de bienvenue via Gmail (non bloquant)
  try {
    sendWelcomeEmailViaGmail(data.email, data.fullName);
  } catch (mailError) {
    console.error('Erreur envoi email bienvenue : ' + mailError);
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Inscription enregistrée'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// 📊 METRICS - Tracking des visites
// ============================================

function handlePageView(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(METRICS_SHEET_NAME);
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Onglet Metrics non trouvé'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Détecter le pays via la langue
  const country = detectCountry(data.language);
  
  // Ajouter la visite
  sheet.appendRow([
    new Date(),
    country,
    data.language || 'fr',
    data.referrer || 'Direct',
    detectDeviceType(data.userAgent)
  ]);
  
  // Mettre à jour les stats quotidiennes
  try {
    updateDailyStats();
  } catch (statsError) {
    console.error('Erreur mise à jour stats quotidiennes : ' + statsError);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Visite enregistrée'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// 📧 EMAIL DE BIENVENUE
// ============================================

function sendWelcomeEmailViaGmail(toEmail, fullName) {
  const subject = 'Merci pour votre inscription 💚 Thank you for signing up';

  const body =
    '=== FRANÇAIS ===\n\n' +
    'Bonjour,\n\n' +
    'Merci pour votre inscription 💚\n\n' +
    'Votre intérêt pour ce projet compte énormément.\n' +
    'Vous serez prévenu(e) sur l\'avancée du projet prochainement.\n\n' +
    'À très bientôt.\n\n' +
    '---\n\n' +
    '=== ENGLISH ===\n\n' +
    'Hello,\n\n' +
    'Thank you for signing up 💚\n\n' +
    'Your interest in this project means a lot to us.\n' +
    'You will be notified about the project\'s progress soon.\n\n' +
    'See you soon.\n\n' +
    '--\nVotre compagnon nutrition / Your nutrition companion';

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    body: body,
    name: FROM_NAME,
    replyTo: REPLY_TO
  });
}

// ============================================
// 📧 ENVOI MASSIF D'EMAILS (Manuel)
// ============================================

function sendWelcomeEmailToAll() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Feuille non trouvée: ' + SHEET_NAME);
  }

  const lastRow = sheet.getLastRow();
  Logger.log('Dernière ligne: ' + lastRow);

  if (lastRow < 2) {
    Logger.log('Aucun inscrit trouvé.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues(); // A:E
  Logger.log('Nombre de lignes lues: ' + data.length);

  data.forEach((row, index) => {
    const fullName = row[1];
    const email    = row[2];

    Logger.log('Ligne ' + (index + 2) + ' -> email: ' + email);

    if (email) {
      try {
        sendWelcomeEmailViaGmail(email, fullName);
        Utilities.sleep(500);
      } catch (e) {
        Logger.log('Erreur envoi à ' + email + ' : ' + e);
      }
    }
  });
}

function testSingleEmail() {
  sendWelcomeEmailViaGmail('jennyvgrimm@gmail.com', 'Test NutriSmart');
}

// ============================================
// 🛠️ UTILITAIRES - Détection Pays & Appareil
// ============================================

function detectCountry(language) {
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

// ============================================
// 📊 MISE À JOUR DES STATS QUOTIDIENNES
// ============================================

function updateDailyStats() {
  const metricsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(METRICS_SHEET_NAME);
  const statsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STATS_SHEET_NAME);
  
  if (!metricsSheet || !statsSheet) {
    console.error('Onglets Metrics ou Stats_Quotidiennes non trouvés');
    return;
  }
  
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
  
  // Ajouter les nouvelles stats triées par date (plus récent en premier)
  const sortedDates = Object.keys(visitsByDay).sort().reverse();
  
  sortedDates.forEach(date => {
    statsSheet.appendRow([date, visitsByDay[date]]);
  });
}
