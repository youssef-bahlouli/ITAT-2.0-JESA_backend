import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      unique: true,
    },
    fullname: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      default: "",
      required: false,
    },
  },
  { timestamps: true }
);

//hash password before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.user_id) {
      this.user_id = await generateUserNumber(this.constructor); // use model context
    }

    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

//compare password

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//auto ID
async function generateUserNumber(UserModel) {
  const count = await UserModel.countDocuments();
  const nextNumber = count + 1;
  return "user-" + nextNumber.toString().padStart(16, "0");
}
export function get_generatedUserNumber(num) {
  return "user-" + num.toString().padStart(16, "0");
}
const User = mongoose.model("User", userSchema);
// users
export default User;
