const express = require("express");
const { google } = require("googleapis");
const app = express();
const port = process.env.PORT || 3000;

// ID de ton spreadsheet et nom de la feuille
const SPREADSHEET_ID = "TON_SPREADSHEET_ID"; // remplacer par ton ID
const SHEET_NAME = "campagnes";

// Configuration Google API
const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json", // fichier JSON du service account
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});

app.get("/newsletter/btp", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Lire toutes les lignes
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return res.json({ date: new Date().toISOString().slice(0,10), campaigns: [] });

    const headers = rows[0]; // première ligne = entêtes
    const data = rows.slice(1).map(row => Object.fromEntries(row.map((v, i) => [headers[i], v])));

    // Filtrer BTP + date du jour
    const today = new Date().toISOString().slice(0, 10);
    const btpToday = data
      .filter(c => c.Secteur === "BTP" && c.Date === today)
      .map(c => ({ marque: c.Marque, url: c["URL visuel"], astuce: c.Astuce }));

    res.json({ date: today, campaigns: btpToday });

  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur API");
  }
});

app.listen(port, () => console.log(`RadarPro API running on port ${port}`));
