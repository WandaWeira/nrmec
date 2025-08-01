const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { authMiddleware, checkPermission } = require("../middleware/middleware");

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Create a new user (SuperAdmin only)
router.post("/add-user", authMiddleware, checkPermission("SuperAdmin"), async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      ...userData,
      password: hashedPassword,
    });

    // Send welcome email with credentials
    const emailHtml = `
      <h1>Welcome to the System</h1>
      <p>Your account has been created with the following credentials:</p>
      <p>Email: ${userData.email}</p>
      <p>Password: ${password}</p>
      <p>For security reasons, please login and reset your password immediately by clicking the "Forgot Password" link on the login page.</p>
      <p>Login here: ${process.env.FRONTEND_URL}/login</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: userData.email,
      subject: "Welcome - Your Account Details",
      html: emailHtml,
    });

    // Remove password from the response
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all users (SuperAdmin and PEO only)
router.get("/users", authMiddleware, checkPermission(["SuperAdmin", "PEO"]), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'resetToken'] }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a user by ID (SuperAdmin and PEO only)
router.get("/users/:id", authMiddleware, checkPermission(["SuperAdmin", "PEO"]), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user (SuperAdmin only)
router.put("/users/:id", authMiddleware, checkPermission("SuperAdmin"), async (req, res) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { id: req.params.id },
    });
    
    if (updated) {
      const updatedUser = await User.findByPk(req.params.id);
      if (req.body.role === 'DistrictRegistra' && req.body.district) {
        updatedUser.district = req.body.district;
      } else if (req.body.role === 'RegionalCoordinator' && req.body.subregion) {
        updatedUser.subregion = req.body.subregion;
      }
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Delete a user (SuperAdmin only)
router.delete("/users/:id", authMiddleware, checkPermission("SuperAdmin"), async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
