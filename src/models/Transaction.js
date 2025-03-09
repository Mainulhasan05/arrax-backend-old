const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema(
  {
    receiver: {
      type: String,
    },
    from: {
      type: String,
    },
    receiverId: {
      type: Number,
    },
    fromId: {
      type: Number,
    },
    amount: {
      type: String,
    },
    level: {
      type: String,
    },
    incomeType: {
      type: String,
    },
    transactionHash: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
