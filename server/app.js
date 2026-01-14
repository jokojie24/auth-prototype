import express from "express";
import session from "express-session";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import webauthnRoutes from "./routes/webauthn.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "auth-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/auth", authRoutes);
app.use("/webauthn", webauthnRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
