import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Adjust the path according to your project structure
import { get_generatedUserNumber } from "../models/User.js"; // Adjust the path according to your project structure
import Session from "../models/Session.js";
import UserPreferences from "../models/UserPreferences.js";
import session from "express-session";
import { requireSession } from "./middleware/session.js";
//ObjectId("6899bbc08b88592d822f6f2b");
//async function issessionDone() {}

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};
router.get("/profile", requireSession, async (req, res) => {
  try {
    console.info("Profile Route");
    console.info("Profile Route");
    console.info("Profile Route");
    console.info("Profile Route");
    console.info("Profile Route");
    console.info("Profile Route");
    console.info("Profile Route");
    console.info("Profile Route");
    console.info("Profile Route");

    console.log("req.user : ", req.user);
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/session", async (req, res) => {
  try {
    //console.log("sssss");
    //console.log(session.user);
    const query = req.headers.query;
    const sessions = await Session.find({
      "session.user.email": { $regex: query, $options: "i" },
      expires: { $gte: new Date() },
    });
    console.log("sessions : ", sessions);

    const latestSession = sessions[0];
    console.log("latestSession : ");
    console.log("latestSession : ", latestSession);
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");
    console.log("between data =");

    console.log("latestSession.session : ", latestSession.session);

    //if (sessions.length <= 0) {
    //  console.warn("No active session found for query:", query);
    //  return res.status(401).json({ error: "Session not found or expired" });
    //}

    console.log("begin :");

    try {
      //const sessionData = JSON.parse(latestSession.session);
      if (latestSession.session.user?.email) {
        console.log(
          "middleware result of session data : ",
          latestSession.session.user?.email
        );
        console.log(
          "middleware result of session data : ",
          latestSession.session.user?.fullname
        );
        req.user = {
          _id: latestSession.session.user?._id,

          email: String(latestSession.session.user?.email),
          fullname: String(latestSession.session.user?.fullname),
        };
        console.warn(" before setting the req.body.user");
        return res.status(200).json({
          success: true,
          user: {
            id: latestSession.session.user?._id,
            email: String(latestSession.session.user?.email),
            fullname: String(latestSession.session.user?.fullname),
          },
        });
      } else {
        return res.status(400).json({
          message: "No designated session found here",
        });
      }
    } catch (err) {
      console.error("Failed to parse session:", err);
      return null;
    }
  } catch (err) {
    console.error("Error fetching sessions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/*
router.get("/session", async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const sessions = await Session.find({}).lean();
    const parsedSessions = sessions
      .map((doc) => {
        try {
          const sessionData = JSON.parse(doc.session);
          return {
            _id: doc._id,
            email: sessionData.user?.email,
            fullname: sessionData.user?.fullname,
            expires: doc.expires,
          };
        } catch (err) {
          console.error("Failed to parse session:", doc._id);
          return null;
        }
      })
      .filter(Boolean);

    const targetEmail = "youssef.bahlouli@edu.isga.ma";

    const matchingSessions = parsedSessions.filter(
      (s) => s.email === targetEmail
    );

    const latestSession = matchingSessions.sort(
      (a, b) => b.expires - a.expires
    )[0];

    console.log("Latest session for", targetEmail, ":", latestSession);

    return res.json({ latestSession });
  } catch (err) {
    console.error("Error fetching sessions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
*/
export default router;
export { requireSession };
