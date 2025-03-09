const express = require("express");
const {
  handleLoginOrRegistration,
  handleOwnerRegistration,
  handleGetUserById,
  getUserGenerationLevels,
  uploadImage,
  handleSlotWithSubSlots,
} = require("../controllers/userController");

const upload = require("../middlewares/multerConfig");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

// image upload
router.post(
  "/update-profile",
  verifyToken,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadImage
);
// Login or register route
router.post("/connect-wallet", handleLoginOrRegistration);
router.post("/register-owner", handleOwnerRegistration);
router.get("/user/:userId/slot", handleSlotWithSubSlots);
router.get("/user/:userId/generations", getUserGenerationLevels);
router.get("/user/:userId", handleGetUserById);

module.exports = router;
