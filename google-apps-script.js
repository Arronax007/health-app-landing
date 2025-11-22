// === Configuration ===
const SHEET_NAME = 'Leads - Health App';
const FROM_NAME = 'Votre compagnon nutrition';
const REPLY_TO = 'jennyvgrimm@gmail.com'; // là où tu veux recevoir les réponses

// === 1) Réception des inscriptions depuis la landing page ===
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Feuille non trouvée'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);

    // Ajout dans la feuille
    sheet.appendRow([
      new Date(),           // Timestamp
      data.fullName,
      data.email,
      data.goal,
      data.consent ? 'Oui' : 'Non'
    ]);

    // Envoi de l’email de bienvenue via Gmail (non bloquant)
    try {
      sendWelcomeEmailViaGmail(data.email, data.fullName);
    } catch (mailError) {
      console.error('Erreur envoi email bienvenue : ' + mailError);
    }

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

// === 2) Endpoint GET pour le compteur d’utilisateurs ===
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

// === 3) Email de bienvenue via Gmail ===
function sendWelcomeEmailViaGmail(toEmail, fullName) {
  const subject = 'Merci pour votre inscription à Votre compagnon nutrition 💚';

  const body =
    'Bonjour,\n\n' +
    'Merci pour votre inscription 💚\n\n' +
    'Votre intérêt pour ce projet compte énormément.\n' +
    'Vous serez prévenu(e) sur l’avancée du projet prochainement.\n\n' +
    'À très bientôt.\n\n' +
    '--\nVotre compagnon nutrition';

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    body: body,
    name: FROM_NAME,
    replyTo: REPLY_TO
  });
}

// === 4) Envoyer l’email à tous les inscrits existants (manuel) ===
// À lancer depuis Apps Script : Exécuter -> sendWelcomeEmailToAll
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