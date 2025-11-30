const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const DB_FILE = "database.json";

function loadDb() {
    if (!fs.existsSync(DB_FILE)) return { licenses: [] };
    return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDb(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// 🔹 Sprawdzenie licencji — BOT wysyła zapytanie tutaj
app.post("/verify", (req, res) => {
    const { license, botId } = req.body;

    if (!license || !botId)
        return res.status(400).json({ valid: false });

    const db = loadDb();
    const lic = db.licenses.find(l => l.key === license);

    if (!lic)
        return res.json({ valid: false });

    if (lic.banned)
        return res.json({ valid: false });

    if (lic.botId !== botId)
        return res.json({ valid: false });

    res.json({ valid: true });
});

// 🔹 Endpoint panelu — tworzenie licencji
app.post("/create", (req, res) => {
    const { license, botId } = req.body;

    const db = loadDb();

    db.licenses.push({
        key: license,
        botId: botId,
        banned: false
    });

    saveDb(db);

    res.json({ success: true });
});

// 🔹 Banowanie licencji
app.post("/ban", (req, res) => {
    const { license } = req.body;

    const db = loadDb();
    const lic = db.licenses.find(l => l.key === license);

    if (!lic) return res.json({ success: false });

    lic.banned = true;
    saveDb(db);

    res.json({ success: true });
});

app.listen(3000, () => {
    console.log("🔐 License server running on port 3000");
});
