// routes/login-sso.js
import express from "express";
import { msalClient } from "./auth/msalClient.js";
import { validateBearer } from "./auth/validateJwt.js";
import User from "../models/User.js";
import Session from "../models/Session.js";

const router = express.Router();
import { requireSession } from "../routes/pages.js";
const removeSessions = async (email) => {
  await Session.deleteMany({
    "session.user.email": { $regex: email, $options: "i" },
    expires: { $gte: new Date() },
  });
};

router.post("/login-sso", validateBearer, async (req, res) => {
  try {
    console.log("✅ Passed validation, hitting login-sso route");

    const userAssertion = res.locals.token; // from middleware
    const tid = req.user?.tid; // tenant ID from the access token
    console.log("\n=\nAfter userAssertion declaration\n=\n");
    console.log("Tenant ID:", tid);
    // Use the token’s tenant for OBO to succeed in multi-tenant scenarios
    const oboRequest = {
      oboAssertion: userAssertion,
      scopes: ["https://graph.microsoft.com/User.Read"],
      authority: tid
        ? `https://login.microsoftonline.com/${tid}`
        : "https://login.microsoftonline.com/common",
    };
    console.log("MSAL config:", msalClient.config.auth);

    const oboResult = await msalClient.acquireTokenOnBehalfOf(oboRequest);
    if (!oboResult?.accessToken) {
      return res
        .status(502)
        .json({ success: false, message: "Failed to get Graph token via OBO" });
    }

    const graphRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${oboResult.accessToken}` },
    });

    if (!graphRes.ok) {
      const details = await graphRes.text();
      return res
        .status(graphRes.status)
        .json({ success: false, message: "Graph /me failed", details });
    }

    const me = await graphRes.json();

    const email =
      (me.mail && String(me.mail).toLowerCase()) ||
      (me.userPrincipalName && String(me.userPrincipalName).toLowerCase());

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "No email/userPrincipalName from Graph",
      });
    }

    let user = await User.findOneAndUpdate({ email });
    if (!user) {
      user = new User({
        email,
        fullname:
          me.displayName || `${me.givenName || ""} ${me.surname || ""}`.trim(),
      });
      user.save("");
    }
    const fullname = user.fullname;
    //removeSessions(email);

    const session = new Session({
      session: { user: user },
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });
    session.save();

    console.log("\n=\nAfter req.session.user declaration\n=\n");

    return res.status(200).json({
      success: true,
      user: { id: user._id, email: user.email, fullname: user.fullname },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)

      .json({ success: false, message: "Server error during Auth" });
  }
});

router.post("/log-out", requireSession, async (req, res) => {
  try {
    console.log("req.user : ", req.user);
    let email = String(req.user.email);
    //if (req.body.email) email = String(req.user.email);

    const sessions = await Session.find({
      "session.user.email": { $regex: String(email), $options: "i" },
      expires: { $gte: new Date() },
    })
      .sort({ expires: -1 }) // newest first
      .lean();
    console.log("📦 Matching sessions:", sessions);

    removeSessions(email);
    //const latestSession = sessions[0];

    //const user = await User.findOne({ email: req.body.user.email });
    console.log("✅ Passed validation, hitting log-out route");
    res.status(200).json({ success: "Logout successful" });
  } catch (err) {
    console.warn("Logout error : ", err);
    res.status(500);
  }
});

export default router;
