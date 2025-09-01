import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header or cookies
    let token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    //console.log("Token from request:", token);

    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user by ID inside token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "Token is not valid" });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Internal server error in auth" });
  }
};

export default protectRoute;
