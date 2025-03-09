const multer = require("multer");

// Multer configuration using memory storage
const storage = multer.memoryStorage(); // Keeps file in memory (no file saved on disk)

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only image files are allowed!"), false); // Reject the file
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max size: 10MB
  fileFilter,
});

module.exports = upload;
