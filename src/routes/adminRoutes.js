const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  getSettings,
  updateRegistration,
  updatePurchasing,
  upgradeUserSlotController,
  updateFeesController,
} = require("../controllers/adminController");
// get all users,
router.get("/users", getAllUsers);
// get single user by id
router.get("/user/:userId", getUserById);
// get settings
router.get("/settings", getSettings);
// update registration status
router.put("/update-registration", updateRegistration);
// update purchasing status
router.put("/update-purchasing", updatePurchasing);
// update fees
router.put("/update-fees", updateFeesController);

// upgrade user slot
router.post("/upgrade-user-slot", upgradeUserSlotController);

module.exports = router;
