const mongoose = require("mongoose");
const ownerWalletSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true },
    totalIncome: { type: Number, default: 0 },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("OwnerWallet", ownerWalletSchema);
