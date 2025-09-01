// index.js
import createApp from "./app.js";

import { connectDB } from "./lib/db.js";

const { app, PORT } = createApp();

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database", error);
    process.exit(1);
  }
};

startServer();
