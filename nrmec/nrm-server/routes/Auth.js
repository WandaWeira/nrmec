const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { User } = require("../models");
const authMiddleware = require("../middleware/middleware").authMiddleware;

const testSMTPConnection = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    return true;
  } catch (error) {
    console.error("SMTP connection failed:", error);
    return false;
  }
};

// Call this when your server starts
testSMTPConnection();
// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    
    if (!user) {

      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);


    if (!isPasswordValid) {

      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });


    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        district: user.district,
        subregion: user.subregion,
      },
    });
  } catch (error) {
    console.error('Detailed login error:', error);
    res.status(500).json({
      message: "An error occurred during login",
      error: error.message,
      stack: error.stack
    });
  }
});

// Forgot password endpoint
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.RESET_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );
    user.resetToken = resetToken;
    await user.save();

    // Send reset password email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">here</a> to reset your password.</p>`,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Password reset error:", error);

    // Add specific error handling for SMTP errors
    if (error.code === "EAUTH") {
      return res.status(500).json({
        message: "Email server authentication failed. Please contact support.",
        error: "SMTP Authentication Error",
      });
    }

    res.status(500).json({
      message: "An error occurred during password reset request",
      error: error.message,
    });
  }
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify the reset token using the same secret used to create it
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Find the user
    const user = await User.findOne({
      where: {
        id: decoded.userId,
        resetToken: token,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or token invalid" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset token
    await user.update({
      password: hashedPassword,
      resetToken: null,
    });

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      message: "An error occurred during password reset",
      error: error.message,
    });
  }
});

// Refresh token endpoint
router.post("/refresh", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      message: "An error occurred during token refresh",
      error: error.message
    });
  }
});

module.exports = router;
