import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

import cookieParser from "cookie-parser";

const router = express.Router();
export default router;
// Set cookie properly on the response
const set_cookie = (token, res) => {
  res.cookie("token", token, {
    httpOnly: true, // secure: true in production (with HTTPS)
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: "lax", // recommended for csrf protection
  });
};

// Get token cookie from request
export const get_cookie = (req) => {
  return req.cookies.token || "";
};

// Generate JWT and set cookie on response
const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  set_cookie(token, res);
  return token;
};

// Use cookie-parser middleware in your main app (not here in router file!)
// e.g. app.use(cookieParser());

router.post("/register", async (req, res) => {
  try {
    console.log("Registering");
    const { fullname, email, password, profileImage } = req.body;
    console.log("Received body:", req.body);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    console.log("step");
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const newUser = new User({
      fullname,
      email: normalizedEmail,
      password,
      profileImage,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
    console.log("User registered successfully");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("Login");

    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return res.status(400).json({ message: "Email not found" });
    }

    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, text: "No match" });
    }

    const token = generateToken(existingUser._id, res);

    res.status(200).json({
      token,
      existingUser,
      success: true,
      text: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during Auth" });
  }
});
