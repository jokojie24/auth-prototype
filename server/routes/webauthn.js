import express from "express";
import {
  beginRegistration,
  finishRegistration,
  beginLogin,
  finishLogin,
} from "../controllers/passkeyController.js";

const router = express.Router();

router.post("/register/begin", beginRegistration);
router.post("/register/finish", finishRegistration);
router.post("/login/begin", beginLogin);
router.post("/login/finish", finishLogin);

export default router;
