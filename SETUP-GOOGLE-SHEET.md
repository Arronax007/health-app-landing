# Configuration Google Sheets pour le formulaire

## 📋 Étape 1 : Créer le Google Sheet

1. Aller sur https://sheets.google.com
2. Créer un nouveau document
3. Renommer le document : **"Leads - Health App"** (ou le nom de ton choix)
4. Renommer la feuille (onglet en bas) : **"Leads - NutriSmart"**

## 📊 Étape 2 : Créer les en-têtes

Dans la première ligne, ajouter les colonnes suivantes :

| A | B | C | D | E |
|---|---|---|---|---|
| **Date** | **Nom complet** | **Email** | **Objectif** | **Consentement** |

## 💻 Étape 3 : Créer le script Apps Script

1. Dans Google Sheets, cliquer sur **Extensions > Apps Script**
2. Supprimer le code par défaut
3. Copier-coller le contenu du fichier `google-apps-script.js`
4. Enregistrer le projet (icône disquette ou Ctrl+S)
5. Nommer le projet : **"API NutriSmart"**

## 🚀 Étape 4 : Déployer le script

1. Cliquer sur **Déployer > Nouveau déploiement**
2. Cliquer sur l'icône ⚙️ (roue dentée) à côté de "Sélectionner un type"
3. Sélectionner **"Application Web"**
4. Configuration :
   - **Description** : "API formulaire NutriSmart"
   - **Exécuter en tant que** : Moi (votre email)
   - **Qui a accès** : **Tout le monde**
5. Cliquer sur **Déployer**
6. **Autoriser l'accès** :
   - Cliquer sur "Autoriser l'accès"
   - Sélectionner votre compte Google
   - Cliquer sur "Paramètres avancés"
   - Cliquer sur "Accéder à [nom du projet] (non sécurisé)"
   - Cliquer sur "Autoriser"

## 🔗 Étape 5 : Copier l'URL de déploiement

1. Une fois déployé, **copier l'URL** qui apparaît
   - Format : `https://script.google.com/macros/s/AKfycby.../exec`
2. **Garder cette URL**, tu en auras besoin pour l'étape suivante

## 📝 Étape 6 : Mettre à jour index.html

1. Ouvrir le fichier `index.html`
2. Chercher la ligne (environ ligne 720) :
   ```javascript
   const GOOGLE_SCRIPT_URL = 'VOTRE_URL_ICI';
   ```
3. Remplacer `'VOTRE_URL_ICI'` par l'URL copiée à l'étape 5
4. Sauvegarder le fichier

Exemple :
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzSTVPCfB5Q3Z4Nv8dHP_MvLLtguiV0EQFpeRPZE3jkhWLijuLFJlPIOs7oatv6wfCG/exec';
```

## ✅ Étape 7 : Tester

1. Commit et push les changements :
   ```powershell
   git add .
   git commit -m "Add Google Sheets integration"
   git push
   ```

2. Attendre que Vercel redéploie (1-2 minutes)

3. Tester le formulaire sur ton site

4. Vérifier que les données arrivent dans Google Sheets

## 🔧 Dépannage

### Le formulaire ne s'envoie pas
- Vérifier que l'URL dans `index.html` est correcte
- Vérifier que le script est bien déployé avec "Qui a accès: Tout le monde"
- Ouvrir la console du navigateur (F12) pour voir les erreurs

### Les données n'arrivent pas dans Sheets
- Vérifier que le nom de la feuille est exactement : `Leads - NutriSmart`
- Vérifier les autorisations du script
- Tester l'URL du script directement dans le navigateur (devrait afficher `{"success":true,"message":"API active"}`)

### Erreur "Feuille non trouvée"
- Le nom de la feuille dans Google Sheets doit correspondre exactement au nom dans le script
- Attention aux espaces et à la casse

## 📊 Format des données reçues

Chaque soumission du formulaire créera une nouvelle ligne avec :
- **Date** : Date et heure de soumission
- **Nom complet** : Prénom et nom
- **Email** : Adresse email
- **Objectif** : Santé globale / Énergie / Poids / Performance / Autre
- **Consentement** : Oui / Non

## 🔄 Mises à jour futures

Si tu veux changer le nom de la feuille :
1. Renommer la feuille dans Google Sheets
2. Modifier le nom dans `google-apps-script.js` (ligne 13)
3. Redéployer le script (Déployer > Gérer les déploiements > Modifier > Nouvelle version)

## 🆘 Support

En cas de problème, vérifie :
- Les autorisations du script
- Le nom exact de la feuille
- L'URL de déploiement dans index.html
- Les logs du script (Apps Script > Exécutions)
