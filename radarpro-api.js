const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const newsletters = {
  "2025-10-05": [
    { marque: "Point.P", resume: "Commandez ce soir...", urlVisuel: "https://dummyimage.com/600x300/ccc/000&text=Point.P", astuce: "Mettre l’accent sur le gain de temps" },
    { marque: "Würth", resume: "Tout pour vos chantiers...", urlVisuel: "https://dummyimage.com/600x300/bbb/000&text=Würth", astuce: "Saisonner les offres" },
    { marque: "Rexel", resume: "Innovation éclairage...", urlVisuel: "https://dummyimage.com/600x300/aaa/000&text=Rexel", astuce: "Ajouter micro-démos produit" }
  ]
};

app.get("/newsletter", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const data = newsletters[today] || [];
  res.json({ date: today, campaigns: data });
});

app.listen(port, () => console.log(`RadarPro API running on port ${port}`));
