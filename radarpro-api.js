const express = require("express");
const { google } = require("googleapis");
const app = express();
const port = process.env.PORT || 3000;

// Récupération des variables d'environnement
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SERVICE_ACCOUNT_JSON = process.env.SERVICE_ACCOUNT_JSON;

// Vérification des variables d'environnement
if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_JSON) {
  console.error("⚠️ SPREADSHEET_ID ou SERVICE_ACCOUNT_JSON non défini !");
  process.exit(1);
}

// Parse le JSON du service account
let serviceAccount;
try {
  serviceAccount = JSON.parse(SERVICE_ACCOUNT_JSON);
} catch (err) {
  console.error("Erreur parsing SERVICE_ACCOUNT_JSON:", err);
  process.exit(1);
}

// Configuration Google API
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});

// Route racine
app.get("/", (req, res) => {
  res.send("🚀 RadarPro API est en ligne ! Endpoint BTP → /newsletter/btp");
});

// Endpoint newsletters BTP
app.get("/newsletter/btp", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "campagnes"
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return res.json({ date: new Date().toISOString().slice(0,10), campaigns: [] });

    // Convertir en objets
    const headers = rows[0];
    const data = rows.slice(1).map(row => Object.fromEntries(row.map((v,i) => [headers[i], v])));

    const today = new Date().toISOString().slice(0,10);

    // Filtrer BTP + date du jour
    const btpToday = data
      .filter(c => c.Secteur === "BTP" && c.Date === today)
      .map(c => ({ marque: c.Marque, url: c["URL visuel"], astuce: c.Astuce }));

    res.json({ date: today, campaigns: btpToday });

  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).send("Erreur API: " + error.message);
  }
});

// Démarrage du serveur
app.listen(port, () => console.log(`RadarPro API running on port ${port}`));
