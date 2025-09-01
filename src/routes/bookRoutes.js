import express from "express";
import Book from "../models/Books.js";
import protectRoute from "../middleware/auth.middleware.js";
import cookieParser from "cookie-parser"; // note: you need to apply this middleware in your app
import { get_cookie } from "./authRoutes.js";
const router = express.Router();

// Make sure your main Express app uses cookieParser middleware, e.g.:
// app.use(cookieParser());

// POST /add — create a book
router.post("/add", protectRoute, async (req, res) => {
  try {
    const { title, author, caption, genre, price } = req.body;

    if (!title || !author || !caption || !genre || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const token = get_cookie(req);

    //if (token) {
    //  console.log("Token exists :\n" + token);
    //}

    // Access the user id set by protectRoute middleware (usually req.user)
    // Assuming protectRoute sets req.user or req.user._id
    //const userId = token.user._id; // adjust depending on your middleware

    const book = new Book({
      title,
      author,
      caption,
      genre,
      price,
      user: req.user._id, // link book to user
    });

    book.save();

    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET / — list books with pagination
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip) // corrected to use skip variable instead of 0
      .limit(limit)
      .populate("user", "fullName profileImage");

    const totalBooks = await Book.countDocuments();

    res.json({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /:id — delete a book
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check ownership: note your Book model field is "user" (singular) or "users"? Adjust accordingly
    if (book.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this book" });
    }

    // Optional: delete image from cloudinary if applicable
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (delError) {
        console.log("Error deleting image from cloudinary:", delError);
      }
    }

    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /user — get books for current logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    // Use req.user._id or req.user_id based on your auth middleware
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const books = await Book.find({ user: userId }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error("Get user books error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
