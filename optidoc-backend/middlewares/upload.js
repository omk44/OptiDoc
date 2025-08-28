const multer = require("multer");
const path = require("path");

// Storage config
// Use memory storage so we can store the file in MongoDB
const storage = multer.memoryStorage();

// File filter (only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });
module.exports = { upload };
