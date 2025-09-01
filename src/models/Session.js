import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.Mixed, // stored as JSON string
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  { strict: false } // allows schemaless fields
);

const Session = mongoose.model("Session", SessionSchema);
export default Session;
