const mongoose = require("mongoose");

const subSlotSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    }, // Reference to parent slot
    subSlotNumber: { type: Number, required: true }, // Sub-slot index (1-12)
    isPurchased: { type: Boolean, default: false }, // Purchase status of the sub-slot
    purchasedBy: { type: Number, default: null }, // UserId of the buyer
    purchasedAt: { type: Date }, // Timestamp of the purchase
    recycledAt: { type: Date }, // Timestamp when this sub-slot was recycled
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubSlot", subSlotSchema);
