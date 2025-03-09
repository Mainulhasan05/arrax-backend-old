const { getUserSlot } = require("../controllers/bookingContractController");
const Order = require("../models/Order");
const User = require("../models/User");
const BN = require("bn.js");
const insertOrderInfo = async ({ user, level, price, transactionHash }) => {
  try {
    console.log("Order received:", {
      user,
      level,
      price,
      transactionHash,
    });
    const userInfo = await User.findOne({ walletAddress: user });
    if (!userInfo) {
      throw new Error("User not found");
    }
    console.log("User found to insert order info", userInfo?.userId);
    const slotInfo = await getUserSlot(userInfo.walletAddress);
    userInfo.currentActiveSlot = slotInfo?.activeSlot;
    // console.log(userInfo.currentActiveSlot);
    await userInfo.save();
    // console.log("Current active slot", userInfo?.currentActiveSlot);

    // Upsert logic: find an existing order or create a new one
    const order = await Order.findOneAndUpdate(
      { userId: userInfo?.userId, level }, // Filter by userId and level
      {
        userId: userInfo?.userId,
        userAddress: user,
        level,
        price,
        transactionHash,
      }, // Data to update or insert
      { new: true, upsert: true } // Return the updated document and create if it doesn't exist
    );
    if (!order) {
      throw new Error("Failed to insert order info");
    }
    console.log("Order information upserted successfully", order?.userId);

    if (!userInfo.isActive) {
      userInfo.isActive = true;
      updateActiveTeamCount(userInfo.userId);
    }
    userInfo.currentActiveSlot = slotInfo?.activeSlot;
    await userInfo.save();

    console.log("Order information upserted successfully");

    return order;
  } catch (error) {
    console.error("Error inserting/updating order info:", error.message);
    throw error;
  }
};

// activeTeam, recursively visit and update all by referredBy field, until you reach the owner where referredBy is null
const updateActiveTeamCount = async (userId) => {
  let currentUserId = userId;
  while (currentUserId) {
    const user = await User.findOne({ userId: currentUserId });
    if (!user) break;

    if (user.referredBy) {
      const referredByUser = await User.findOne({ userId: user.referredBy });
      if (referredByUser) {
        referredByUser.activeTeam = (referredByUser.activeTeam || 0) + 1;
        await referredByUser.save();
        currentUserId = referredByUser.userId; // Move up the hierarchy
      } else {
        break;
      }
    } else {
      break;
    }
  }
};

module.exports = {
  insertOrderInfo,
};
