import bcrypt from "bcrypt";
import db from "../models/userModel.js";
import { v4 as uuid } from "uuid";

export const register = async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const id = uuid();

  db.run(
    "INSERT INTO users (id, email, password) VALUES (?, ?, ?)",
    [id, email, hash],
    (err) => {
      if (err) return res.status(400).json({ error: "User exists" });
      res.json({ message: "Registered" });
    }
  );
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    req.session.user = user.id;
    res.json({ message: "Password login success" });
  });
};
