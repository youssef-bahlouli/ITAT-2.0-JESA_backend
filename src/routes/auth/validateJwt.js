import { createRemoteJWKSet, jwtVerify } from "jose";
const jwks = createRemoteJWKSet(
  new URL("https://login.microsoftonline.com/common/discovery/v2.0/keys")
);
export async function validateBearer(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No bearer token" });
    }
    const token = auth.replace("Bearer ", "").trim();
    console.log("Received token:\n", token);

    const { payload } = await jwtVerify(token, jwks);
    console.log("\n=\nAfter payload declaration\n=\n");

    // Extract claims
    const { aud, iss, tid, scp } = payload;

    // Flexible audience check
    const expectedAud = process.env.API_AUDIENCE;
    const validAudiences = [expectedAud, expectedAud.replace("api://", "")];

    if (!validAudiences.includes(aud)) {
      console.log("Expected audience:", expectedAud);
      console.log("Token audience:", aud);
      return res
        .status(401)
        .json({ success: false, message: "Audience mismatch" });
    }

    // Optional issuer validation (recommended)
    const expectedIssuer = `https://login.microsoftonline.com/${tid}/v2.0`;
    if (iss !== expectedIssuer) {
      console.log("Expected issuer:", expectedIssuer);
      console.log("Token issuer:", iss);
      return res
        .status(401)
        .json({ success: false, message: "Issuer mismatch" });
    }

    console.log("\n=\nAfter payload validation\n=\n");

    // Scope check
    if (!scp?.includes("check")) {
      return res
        .status(403)
        .json({ success: false, message: "Missing scope 'check'" });
    }

    console.log("✅ Token validated successfully");
    req.user = payload;
    res.locals.token = token;
    return next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}
