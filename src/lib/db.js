import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

/*


Connecting to:
mongodb+srv://itat11admin:asd_asd_11@cluster11itat.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000
Using MongoDB:
Using Mongosh:
8.0.0 1.10.1
For mongosh info see: https://docs.mongodb.com/mongodb-shell/
[mongos] test>[


*/
