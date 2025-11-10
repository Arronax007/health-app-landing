// Google Apps Script à déployer dans Google Sheets
// Instructions :
// 1. Créer un nouveau Google Sheet
// 2. Nommer la feuille : "Leads - NutriSmart" (ou le nom de ton app)
// 3. Aller dans Extensions > Apps Script
// 4. Copier-coller ce code
// 5. Déployer > Nouveau déploiement > Type: Application Web
// 6. Qui a accès: Tout le monde
// 7. Copier l'URL de déploiement et la mettre dans index.html (ligne ~720)

function doPost(e) {
  try {
    // Récupérer la feuille (change le nom si nécessaire)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads - Health App');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Feuille non trouvée'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parser les données
    const data = JSON.parse(e.postData.contents);
    
    // Ajouter une ligne avec les données
    sheet.appendRow([
      new Date(), // Timestamp
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

// Fonction de test (optionnelle)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'API active'
  })).setMimeType(ContentService.MimeType.JSON);
}
