// server/local-leaderboard.ts
import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

// Create the Express app
const app = express();
app.use(cors());
app.use(express.json());

// JSON file used as database
const adapter = new JSONFile("leaderboard.json");
const db = new Low(adapter, { leaderboard: [] });

// Read existing data (or init)
await db.read();

// --- Routes ----------------------------------------------------

// Get all scores
app.get("/leaderboard", async (_req, res) => {
    await db.read();
    res.json(db.data.leaderboard.sort((a, b) => b.score - a.score));
});

// Add a new score
app.post("/leaderboard", async (req, res) => {
    const { name, score } = req.body;
    if (!name || typeof score !== "number")
        return res.status(400).json({ error: "Invalid payload" });

    db.data.leaderboard.push({ name, score, date: new Date().toISOString() });
    await db.write();

    res.json({ success: true });
});

// ---------------------------------------------------------------
const PORT = 3000;
app.listen(PORT, () =>
    console.log(`✅ Local leaderboard running at http://localhost:${PORT}`)
);
