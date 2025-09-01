import express from "express";
import jwt from "jsonwebtoken";
import User, { get_generatedUserNumber } from "../../models/User.js"; // Adjust the path according to your project structure
import Session from "../../models/Session.js";
import UserPreferences from "../../models/UserPreferences.js";

import session from "express-session";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

async function requireSession(req, res, next) {
  try {
    //console.log("sssss");
    //console.log(session.user);
    const query = String(req.headers.query);
    console.log("headerss\n\n====== : ", req.headers + "\n=====");
    const sessions = await Session.find({
      "session.user.email": { $regex: String(query), $options: "i" },
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

    console.log("latestSession.session : ", latestSession);

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

        next();
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
}

export default router;
export { requireSession };
