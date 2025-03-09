const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const {
  initializePurchaseController,
} = require("../controllers/purchaseController");

router.post("/initialize-purchase", verifyToken, initializePurchaseController);

module.exports = router;
