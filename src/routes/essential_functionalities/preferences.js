import express from "express";
import jwt from "jsonwebtoken";
import User, { get_generatedUserNumber } from "../../models/User.js"; // Adjust the path according to your project structure
import UserPreferences from "../../models/UserPreferences.js"; // Adjust the path according to your project structure
import { requireSession } from "../middleware/session.js";
import Session from "../../models/Session.js";
import session from "express-session";
import userPreferences from "../../models/UserPreferences.js";

//ObjectId("6899bbc08b88592d822f6f2b");
//async function issessionDone() {}

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};
const cleanJson = (json) => {
  const result = {};

  for (const key in json) {
    const value = json[key];

    if (value === "") continue; // Skip empty strings

    if (Array.isArray(value)) {
      const filtered = value.filter((v) => v !== "");
      if (filtered.length > 0) result[key] = filtered;
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      const cleaned = cleanJson(value);
      if (Object.keys(cleaned).length > 0) result[key] = cleaned;
    } else {
      result[key] = value;
    }
  }

  return result;
};

const mergeJson = (json1, json2) => {
  json1 = cleanJson(json1);
  json2 = cleanJson(json2);

  const result = { ...json1 };

  for (const key in json2) {
    const val2 = json2[key];

    // Skip empty strings
    if (val2 === "") continue;

    if (result.hasOwnProperty(key)) {
      const val1 = result[key];

      // Merge arrays and remove duplicates
      if (Array.isArray(val1) && Array.isArray(val2)) {
        result[key] = [...new Set([...val1, ...val2].filter((v) => v !== ""))];
      }

      // Merge nested objects
      else if (
        typeof val1 === "object" &&
        typeof val2 === "object" &&
        !Array.isArray(val1) &&
        !Array.isArray(val2)
      ) {
        result[key] = mergeJson(val1, val2); // fixed recursive call
      }

      // Merge primitives into array (avoid duplicates and empty strings)
      else {
        const merged = [val1, val2].filter(
          (v, i, arr) => v !== "" && arr.indexOf(v) === i
        );
        result[key] = merged.length === 1 ? merged[0] : merged;
      }
    } else {
      // Add new key, filter empty strings if it's an array
      result[key] = Array.isArray(val2) ? val2.filter((v) => v !== "") : val2;
    }
  }

  return result;
};

router.get("/userPreferences", requireSession, async (req, res) => {
  try {
    console.info("userPreferences Route");
    console.info("userPreferences Route");
    console.info("userPreferences Route");
    console.info("userPreferences Route");
    console.info("userPreferences Route");
    console.info("userPreferences Route");
    console.info("userPreferences Route");
    console.info("userPreferences Route");
    console.info("userPreferences Route");

    console.log("req.user : ", req.user);
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userPreferences = await UserPreferences.findOne({ user: user._id });
    res.json(userPreferences);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.patch("/userPreferences", requireSession, async (req, res) => {
  console.log("PAtch userPreferences");
  console.log("PAtch userPreferences");
  console.log("PAtch userPreferences");
  console.log("PAtch userPreferences");
  console.log("req.user" + req.user._id);
  //Preparing the preferences to input them in the database

  let userPreferences = await UserPreferences.findOne({ user: req.user._id });
  const headersJson = req.headers.preferences;
  let preferences = JSON.parse(headersJson);
  if (!userPreferences) {
    //return res.status(404).json({ error: "UserPreferences not found" });
    userPreferences = new UserPreferences({
      user: req.user._id,
      preferences: preferences,
    });
    await userPreferences.save();
  } else {
    userPreferences.preferences = mergeJson(
      userPreferences.preferences,
      preferences
    );

    //const merged = mergeJson(json1, json2);
  }
  userPreferences.updatedAt = Date.now();
  await userPreferences.save();
  return res.status(201).json(userPreferences);
});

router.patch("/userPreferences/reset", requireSession, async (req, res) => {
  console.log("PAtch userPreferences");
  console.log("PAtch userPreferences");
  console.log("PAtch userPreferences");
  console.log("PAtch userPreferences");
  console.log("req.user" + req.user._id);
  //Preparing the preferences to input them in the database

  let userPreferences = await UserPreferences.findOne({ user: req.user._id });
  if (!userPreferences) {
    //return res.status(404).json({ error: "UserPreferences not found" });
    userPreferences = new UserPreferences({
      user: req.user._id,
      preferences: {},
    });
    await userPreferences.save();
  } else {
    userPreferences.preferences = {};
    //const merged = mergeJson(json1, json2);
  }
  userPreferences.updatedAt = Date.now();
  await userPreferences.save();
  return res.status(201).json(userPreferences);
});

export default router;
