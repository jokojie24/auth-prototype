import express from "express";
import { register, login } from "../controllers/passwordController.js";
import { sendOTP, verifyOTP } from "../controllers/mfaController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/mfa/send", sendOTP);
router.post("/mfa/verify", verifyOTP);


export default router;
