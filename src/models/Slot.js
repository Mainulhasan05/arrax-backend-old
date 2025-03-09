const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
    }, // Reference to the User model
    walletAddress: { type: String, required: true }, // Wallet address of the user
    slot: { type: Number, required: true }, // Slot number
    data: {
      referralCount: { type: String, required: true }, // Referral count as a string
      recycleCount: { type: String, required: true }, // Recycle count as a string
      slotTransactions: { type: String, required: true }, // Slot transactions as a string
      isUpgraded: { type: Boolean, required: true }, // Upgrade status
      isActive: { type: Boolean, required: true }, // Active status
    },
  },
  { timestamps: true }
);

// Predefined slot prices for use in the application
slotSchema.statics.slotPrices = [4, 8, 15, 30, 60, 120, 240, 480, 960, 1920];

module.exports = mongoose.model("Slot", slotSchema);
