import { mongoose } from "mongoose";
const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: [String], required: true },
    caption: { type: String, required: true },
    price: { type: Number, required: false },
    //
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const Book = mongoose.model("Book", bookSchema);

export default Book;
