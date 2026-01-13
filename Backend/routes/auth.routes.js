// routes/auth.routes.js
import express from "express";
import otpGenerator from "otp-generator";
import Otp from "../models/Otp.js";
import { sendEmail } from "../utils/sendEmail.js";

const email_route = express.Router();

email_route.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendEmail(email, otp);

  res.json({ success: true, message: "OTP sent to email" });
});

email_route.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const record = await Otp.findOne({ email, otp });

  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  await Otp.deleteMany({ email });

  res.json({ success: true });
});

export default email_route;
