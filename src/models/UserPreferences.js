import { mongoose } from "mongoose";
const userPreferencesSchema = new mongoose.Schema(
  {
    //author: { type: String, required: true },
    preferences: { type: JSON, required: true },
    //caption: { type: String, required: true },
    //
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const userPreferences = mongoose.model(
  "userPreferences",
  userPreferencesSchema
);

export default userPreferences;
