const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      unique: true,
      required: true,
      index: true,
    },
    fullName: { type: String, required: true },
    walletAddress: { type: String, unique: true, required: true },
    image: { type: String, required: false },
    isActive: { type: Boolean, default: false }, // Set false for inactive users
    referredBy: { type: Number, required: false }, // Referral's userId
    referrerAddress: { type: String, required: false }, // Wallet address of the referrer
    isOwner: { type: Boolean, default: false }, // Set true for the system owner
    directReferrals: { type: [Number], default: [] }, // Array of userIds directly referred by this user
    totalPartners: { type: Number, default: 0 }, // Total direct referrals
    totalTeam: { type: Number, default: 0 }, // Total users under this user
    activeTeam: { type: Number, default: 0 }, // Total active users under this user
    dailyIncome: { type: Number, default: 0 }, // Daily income
    dailyJoining: { type: Number, default: 0 }, // Daily joining
    dailyTeam: { type: Number, default: 0 },
    dailyPartners: { type: Number, default: 0 },
    dailyActivePartners: { type: Number, default: 0 },
    dailyTotalIncome: { type: Number, default: 0 },
    dailyLevelIncome: { type: Number, default: 0 },
    dailyDirectIncome: { type: Number, default: 0 },
    currentActiveSlot: { type: Number, default: 0 }, // Current active slot

    roles: {
      type: [String],
      default: ["user"],
      enum: ["user", "admin", "owner"],
    },
    income: {
      total: { type: Number, default: 0 },
      levelIncome: { type: Number, default: 0 }, // Income from levels
      directIncome: { type: Number, default: 0 }, // Income from direct referrals
      slotIncome: { type: Number, default: 0 }, // Income from slot transactions
      recycleIncome: { type: Number, default: 0 }, // Income from recycled slots
      salaryIncome: { type: Number, default: 0 }, // Income from salaries
    },
  },
  { timestamps: true }
);

// Attach auto-increment plugin for userId
// userSchema.plugin(AutoIncrement, { inc_field: "userId" });

module.exports = mongoose.model("User", userSchema);
