import db from "../models/userModel.js";
import { generateOTP, otpExpiry } from "../utils/otp.js";

export const sendOTP = (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  const expiry = otpExpiry();

  db.run(
    "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?",
    [otp, expiry, email],
    function (err) {
      if (this.changes === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      console.log("OTP (simulated):", otp);
      res.json({ message: "OTP generated" });
    }
  );
};

export const verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (!user) return res.status(400).json({ error: "User not found" });

      if (user.otp !== otp || Date.now() > user.otp_expiry) {
        return res.status(401).json({ error: "Invalid or expired OTP" });
      }

      req.session.user = user.id;
      res.json({ message: "MFA login successful" });
    }
  );
};
