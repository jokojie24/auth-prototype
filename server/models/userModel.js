import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      otp TEXT,
      otp_expiry INTEGER,
      webauthn_credential TEXT
    )
  `);
});

export default db;
