// sessionConfig.js
import session from "express-session";
import MongoStore from "connect-mongo";

export default session({
  name: "sid", // Custom cookie name
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:
      process.env.MONGO_URI ||
      "mongodb+srv://itat11admin:asd_asd_11@cluster11itat.mongocluster.cosmos.azure.com/ITDepo?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000",
    collectionName: "sessions",
    ttl: 60 * 60 * 2, // 2 hours
  }),
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "lax", // or 'none' for cross-origin with credentials
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
  },
});
