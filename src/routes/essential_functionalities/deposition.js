import express from "express";
import jwt from "jsonwebtoken";
import User, { get_generatedUserNumber } from "./../../models/User.js"; // Adjust the path according to your project structure
import UserPreferences from "./../../models/UserPreferences.js"; // Adjust the path according to your project structure
import { requireSession } from "../middleware/session.js";
import Session from "../../models/Session.js";
import session from "express-session";
import userPreferences from "./../../models/UserPreferences.js";
import Deposition from "../../models/Deposition.js";
import mongoose from "mongoose";
//ObjectId("6899bbc08b88592d822f6f2b");
//async function issessionDone() {}

async function get_input_history(userId) {
  return await Deposition.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId), // Ensure ObjectId
      },
    },
    {
      $addFields: {
        day: { $dayOfMonth: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$day",
        matches: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        day: "$_id",
        matches: 1,
      },
    },
    {
      $sort: { day: 1 },
    },
  ]);
}

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

router.get("/deposition", requireSession, async (req, res) => {
  try {
    //console.log("req.user : ", req.user);
    //console.warn("IDDDDDD :" + "ObjectId('" + user._id + "')");
    const depositions = await Deposition.find({ user: req.user._id });
    //console.log(depositions);
    //const userPreferences = await UserPreferences.findOne({ user: user._id });
    const history = await get_input_history(req.user._id);
    const response = {
      all_depositions: depositions.length,
      depositions: depositions,
      history: history,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/deposition/insert", requireSession, async (req, res) => {
  //Preparing the preferences to input them in the database
  let data = JSON.parse(req.headers.data);
  console.log(data);
  let model = data["model"];
  let type = data["type"];
  let inventoryName = data["inventoryName"];
  const user = new User({ email: req.user.email });
  const deposition = new Deposition({
    model: model,
    type: type,
    inventoryName: inventoryName,
    user: req.user._id,
  });
  console.warn("db user : ", user);
  if (data["quantity"] !== "") {
    console.log("quantity here");
    console.log("quantity here");
    console.log("quantity here");
    console.log("quantity here");
    console.log("quantity here");
    //deposition.add((quantity = data["quantity"]));
    deposition.quantity = data["quantity"];
  }
  if (data["serialNumber"] !== "")
    deposition.serialNumber = data["serialNumber"];
  await deposition.save("");
  return res.status(201).json(deposition);
});

router.get("/deposition/search", requireSession, async (req, res) => {
  try {
    //console.info("get depositions Search");
    //console.info("get depositions Search");
    //console.info("get depositions Search");
    //console.info("get depositions Search");
    //console.info("get depositions Search");
    //console.info("get depositions Search");
    //console.info("get depositions Search");
    //
    //console.log("req.user : ", req.user);
    //const user = await User.findOne({ email: req.user.email });
    //if (!user) {
    //  return res.status(404).json({ error: "User not found" });
    //}
    //console.warn("IDDDDDD :" + "ObjectId('" + user._id + "')");

    const searchTerm = req.headers.data;
    const filter = req.headers.filter;
    //const searchTerm = "tilab"; // Can be string, number-like, or date-like
    const searchRegex = new RegExp(searchTerm, "i"); // case-insensitive

    const buildSearchConditions = () => {
      const conditions = [
        { model: { $regex: searchRegex } },
        { inventoryName: { $regex: searchRegex } },
        { inventoryString: { $regex: searchRegex } },
        { type: { $regex: searchRegex } },
      ];

      if (!isNaN(Number(searchTerm))) {
        conditions.push({ quantity: Number(searchTerm) });
      }

      if (searchTerm.match(/^[0-9a-fA-F]{24}$/)) {
        conditions.push({ _id: searchTerm }); // or another field
      }

      return conditions;
    };

    const query = {
      user: req.user._id,
      $or: buildSearchConditions(),
    };
    const sortOption = filter === "new_to_old" ? { createdAt: -1 } : {};

    const results = await Deposition.find(query).sort(sortOption);

    //console.log(results);
    //const userPreferences = await UserPreferences.findOne({ user: user._id });
    //const history = await get_input_history(user._id);
    const response = {
      all_results: results.length,
      depositions: results,
      //history: history,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/deposition/delete/part", requireSession, async (req, res) => {
  try {
    console.log("run");
    console.log("run");
    console.log("run");
    console.log("run");
    console.log("run");
    console.log("run");
    console.log("run");
    const array = JSON.parse(req.headers.depositions);
    for (let i in array) {
      await Deposition.deleteOne({
        inventoryString: { $regex: array[i], $options: "i" },
      });
    }
    //et array = JSON.parse(req.headers.depositions);
    //let model = array["model"];

    res.json({
      status: "success",
      message: "Depositions deleted successfully",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error\n" + error });
  }
});
export default router;
