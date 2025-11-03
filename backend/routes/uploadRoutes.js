import express from "express";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const router = express.Router();

// Temporary storage for images before upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route for uploading image
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const fileStr = req.file.buffer.toString("base64");

    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${fileStr}`,
      { folder: "talkloop" } // optional folder name
    );

    res.json({
      url: uploadResponse.secure_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Image upload failed" });
  }
});

export default router;
