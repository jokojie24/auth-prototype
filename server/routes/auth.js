import express from "express";
import { register, login } from "../controllers/passwordController.js";
import { sendOTP, verifyOTP } from "../controllers/mfaController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/mfa/send", sendOTP);
router.post("/mfa/verify", verifyOTP);

import { requireMFA } from "../controllers/mfaController.js";
router.get("/secure-data", requireMFA, (req, res) => {
  res.json({ secret: "This data is protected by MFA session enforcement." });
});

export default router;
