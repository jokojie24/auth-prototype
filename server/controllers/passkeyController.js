import crypto from "crypto";
import db from "../models/userModel.js";

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

import { rpName, rpID, origin } from "../utils/webauthnConfig.js";

/**
 * In-memory challenge store (OK for prototype)
 * Keyed by email to support multi-user
 */
const challenges = new Map();

/* =========================================================
   PASSKEY REGISTRATION – BEGIN
========================================================= */
export const beginRegistration = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("BEGIN REGISTRATION REQUEST FOR:", email);

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error("DB ERROR:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }

        const userID = crypto.randomBytes(32);

        const options = await generateRegistrationOptions({
          rpName,
          rpID,
          userID,
          userName: email,
          userDisplayName: email,
          attestationType: "none",
        });

        if (!options?.challenge) {
          return res.status(500).json({ error: "Challenge generation failed" });
        }

        challenges.set(email, options.challenge);
        return res.json(options);
      }
    );
  } catch (error) {
    console.error("BEGIN REGISTRATION ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================================================
   PASSKEY REGISTRATION – FINISH
========================================================= */
export const finishRegistration = async (req, res) => {
  try {
    const { email, credential } = req.body;
    console.log("FINISH REGISTRATION FOR:", email);

    const expectedChallenge = challenges.get(email);
    if (!expectedChallenge) {
      return res.status(400).json({ error: "No challenge found" });
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified) {
      return res.status(400).json({ error: "Registration failed" });
    }

    const { credential: regCred } = verification.registrationInfo;

    const storedCredential = {
      credentialID: regCred.id, // base64url
      credentialPublicKey: Buffer.from(regCred.publicKey).toString("base64url"),
      counter: regCred.counter,
    };

    console.log("STORING PASSKEY:", storedCredential);

    db.run(
      "UPDATE users SET webauthn_credential = ? WHERE email = ?",
      [JSON.stringify(storedCredential), email],
      (err) => {
        if (err) {
          console.error("DB SAVE ERROR:", err);
          return res.status(500).json({ error: "Failed to save credential" });
        }

        challenges.delete(email);
        return res.json({ message: "Passkey registered" });
      }
    );
  } catch (error) {
    console.error("FINISH REGISTRATION ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================================================
   PASSKEY LOGIN – BEGIN (MULTI-USER SAFE)
========================================================= */
export const beginLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    db.get(
      "SELECT webauthn_credential FROM users WHERE email = ?",
      [email],
      async (err, row) => {
        if (err || !row || !row.webauthn_credential) {
          return res.status(400).json({ error: "No passkey registered" });
        }

        const options = await generateAuthenticationOptions({
          rpID,
          userVerification: "preferred",
        });

        if (!options?.challenge) {
          return res.status(500).json({ error: "Challenge generation failed" });
        }

        challenges.set(email, options.challenge);
        return res.json(options);
      }
    );
  } catch (error) {
    console.error("BEGIN LOGIN ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================================================
   PASSKEY LOGIN – FINISH (MULTI-USER SAFE)
========================================================= */
export const finishLogin = async (req, res) => {
  try {
    const { email, credential } = req.body;
    const expectedChallenge = challenges.get(email);

    if (!expectedChallenge) {
      return res.status(400).json({ error: "No challenge found" });
    }

    db.get(
      "SELECT webauthn_credential FROM users WHERE email = ?",
      [email],
      async (err, row) => {
        if (err || !row || !row.webauthn_credential) {
          return res.status(400).json({ error: "User or passkey not found" });
        }

        const stored = JSON.parse(row.webauthn_credential);

        // Match credential ID
        const assertionID = Buffer.from(
          credential.rawId,
          "base64url"
        ).toString("base64url");

        if (stored.credentialID !== assertionID) {
          return res.status(401).json({ error: "Credential mismatch" });
        }

        const authenticator = {
          id: Buffer.from(stored.credentialID, "base64url"),
          publicKey: Buffer.from(stored.credentialPublicKey, "base64url"),
          counter: stored.counter,
        };

        const verification = await verifyAuthenticationResponse({
          response: credential,
          expectedChallenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
          credential: authenticator,
        });

        if (!verification.verified) {
          return res.status(401).json({ error: "Authentication failed" });
        }

        stored.counter = verification.authenticationInfo.newCounter;

        db.run(
          "UPDATE users SET webauthn_credential = ? WHERE email = ?",
          [JSON.stringify(stored), email]
        );

        challenges.delete(email);
        return res.json({ message: "Passkey login successful" });
      }
    );
  } catch (error) {
    console.error("PASSKEY LOGIN ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
