const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret_jwt_key_change_me";

// Middleware
app.use(cors());
app.use(express.json());

// SQLite setup
const dbPath = path.join(__dirname, "db.sqlite");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      created_by INTEGER,
      expires_at TEXT,
      created_at TEXT,
      FOREIGN KEY(created_by) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id INTEGER,
      text TEXT,
      FOREIGN KEY(poll_id) REFERENCES polls(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id INTEGER,
      option_id INTEGER,
      user_id INTEGER,
      created_at TEXT,
      UNIQUE(poll_id, user_id),
      FOREIGN KEY(poll_id) REFERENCES polls(id),
      FOREIGN KEY(option_id) REFERENCES options(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

// Helper: auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// Auth routes
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  const stmt = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
  stmt.run(name || "", email, password_hash, function (err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ message: "Email already in use" });
      }
      return res.status(500).json({ message: "Error creating user" });
    }
    const user = { id: this.lastID, name: name || "", email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (!row) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = bcrypt.compareSync(password, row.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const user = { id: row.id, name: row.name, email: row.email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
  });
});

// Create poll
app.post("/api/polls", authMiddleware, (req, res) => {
  const { question, options, expiresAt } = req.body;

  if (!question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: "Question and at least 2 options are required" });
  }

  const createdAt = new Date().toISOString();

  db.run(
    "INSERT INTO polls (question, created_by, expires_at, created_at) VALUES (?, ?, ?, ?)",
    [question, req.user.id, expiresAt || null, createdAt],
    function (err) {
      if (err) return res.status(500).json({ message: "Error creating poll" });

      const pollId = this.lastID;
      const stmt = db.prepare("INSERT INTO options (poll_id, text) VALUES (?, ?)");
      options.forEach((opt) => {
        stmt.run(pollId, opt);
      });
      stmt.finalize((stmtErr) => {
        if (stmtErr) return res.status(500).json({ message: "Error saving options" });
        res.json({ id: pollId, question, options, expiresAt, createdAt });
      });
    }
  );
});

// Get all polls with options & counts
app.get("/api/polls", authMiddleware, (req, res) => {
  const now = new Date().toISOString();

  const query = `
    SELECT p.*, 
           o.id as option_id, o.text as option_text,
           COUNT(v.id) as vote_count
    FROM polls p
    LEFT JOIN options o ON p.id = o.poll_id
    LEFT JOIN votes v ON o.id = v.option_id
    GROUP BY o.id
    ORDER BY p.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching polls" });

    const pollsMap = {};
    rows.forEach((row) => {
      if (!pollsMap[row.id]) {
        pollsMap[row.id] = {
          id: row.id,
          question: row.question,
          created_by: row.created_by,
          expires_at: row.expires_at,
          created_at: row.created_at,
          is_expired: row.expires_at ? row.expires_at <= now : false,
          options: [],
        };
      }
      if (row.option_id) {
        pollsMap[row.id].options.push({
          id: row.option_id,
          text: row.option_text,
          votes: row.vote_count,
        });
      }
    });

    const polls = Object.values(pollsMap);

    // Also check which polls the current user has voted in
    const pollIds = polls.map((p) => p.id);
    if (pollIds.length === 0) return res.json([]);

    const placeholders = pollIds.map(() => "?").join(",");
    db.all(
      `SELECT poll_id FROM votes WHERE user_id = ? AND poll_id IN (${placeholders})`,
      [req.user.id, ...pollIds],
      (err2, votesRows) => {
        if (err2) return res.status(500).json({ message: "Error fetching votes" });

        const votedSet = new Set(votesRows.map((v) => v.poll_id));
        const enriched = polls.map((p) => ({
          ...p,
          has_voted: votedSet.has(p.id),
        }));

        res.json(enriched);
      }
    );
  });
});

// Vote on a poll
app.post("/api/polls/:id/vote", authMiddleware, (req, res) => {
  const pollId = req.params.id;
  const { optionId } = req.body;
  const userId = req.user.id;

  if (!optionId) {
    return res.status(400).json({ message: "optionId is required" });
  }

  // Check poll exists and not expired
  db.get("SELECT * FROM polls WHERE id = ?", [pollId], (err, poll) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (poll.expires_at && poll.expires_at <= new Date().toISOString()) {
      return res.status(400).json({ message: "Poll has expired" });
    }

    // Check if user already voted
    db.get(
      "SELECT * FROM votes WHERE poll_id = ? AND user_id = ?",
      [pollId, userId],
      (err2, existing) => {
        if (err2) return res.status(500).json({ message: "Database error" });
        if (existing) {
          return res.status(400).json({ message: "You have already voted in this poll" });
        }

        const createdAt = new Date().toISOString();
        db.run(
          "INSERT INTO votes (poll_id, option_id, user_id, created_at) VALUES (?, ?, ?, ?)",
          [pollId, optionId, userId, createdAt],
          function (err3) {
            if (err3) return res.status(500).json({ message: "Error saving vote" });
            res.json({ message: "Vote recorded" });
          }
        );
      }
    );
  });
});

// Get single poll with results
app.get("/api/polls/:id", authMiddleware, (req, res) => {
  const pollId = req.params.id;
  const now = new Date().toISOString();

  const query = `
    SELECT p.*, 
           o.id as option_id, o.text as option_text,
           COUNT(v.id) as vote_count
    FROM polls p
    LEFT JOIN options o ON p.id = o.poll_id
    LEFT JOIN votes v ON o.id = v.option_id
    WHERE p.id = ?
    GROUP BY o.id
  `;

  db.all(query, [pollId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching poll" });
    if (rows.length === 0) return res.status(404).json({ message: "Poll not found" });

    const pollRow = rows[0];
    const poll = {
      id: pollRow.id,
      question: pollRow.question,
      created_by: pollRow.created_by,
      expires_at: pollRow.expires_at,
      created_at: pollRow.created_at,
      is_expired: pollRow.expires_at ? pollRow.expires_at <= now : false,
      options: rows
        .filter((r) => r.option_id)
        .map((r) => ({
          id: r.option_id,
          text: r.option_text,
          votes: r.vote_count,
        })),
    };

    db.get(
      "SELECT * FROM votes WHERE poll_id = ? AND user_id = ?",
      [pollId, req.user.id],
      (err2, existing) => {
        if (err2) return res.status(500).json({ message: "Error fetching vote" });
        poll.has_voted = !!existing;
        res.json(poll);
      }
    );
  });
});

app.get("/", (req, res) => {
  res.send("Poll backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
