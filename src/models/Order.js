const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
    },
    userAddress: { type: String },
    level: { type: String },
    price: { type: String },
    transactionHash: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
