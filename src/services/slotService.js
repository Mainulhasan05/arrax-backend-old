const Order = require("../models/Order");
const User = require("../models/User");
const Slot = require("../models/Slot");
const {
  getUserSlot,
  getLevelReferralDetails,
  upgradeUserSlot,
} = require("../controllers/bookingContractController");

const insertSlotInfo = async ({ user, level }) => {
  try {
    console.log("@@@@@@@@@ inserting slot started @@@@@@@@@@@");
    const userInfo = await User.findOne({ walletAddress: user });
    if (!userInfo) {
      throw new Error("User not found");
    }

    console.log("User found to insert slot info", userInfo?.userId);

    const currentSlot = await getUserSlot(userInfo.walletAddress);
    const activeSlot = currentSlot?.activeSlot;

    userInfo.currentActiveSlot = activeSlot;
    await userInfo.save();
    const currentLevel = Number(level);
    console.log("Current level", currentLevel, currentSlot);

    const levelReferralDetails = await getLevelReferralDetails(
      userInfo.walletAddress,
      currentLevel
    );

    console.log("Level referral details slot service ", levelReferralDetails);

    const convertedDetails = JSON.parse(
      JSON.stringify(levelReferralDetails, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    if (!convertedDetails?.data === undefined) {
      throw new Error("No data found");
    }
    console.log("Details for current slot", convertedDetails.data);

    // Upsert logic: find an existing slot or create a new one
    const slot = await Slot.findOneAndUpdate(
      { userId: userInfo?.userId, slot: currentLevel }, // Filter by userId and slot
      {
        userId: userInfo?.userId,
        walletAddress: user,
        slot: currentLevel,
        data: convertedDetails.data,
      }, // Data to update or insert
      { new: true, upsert: true } // Return the updated document and create if it doesn't exist
    );

    console.log("Slot information upserted successfully");
    if (userInfo.referredBy !== null) {
      const referrearUser = await User.findOne({
        userId: userInfo.referredBy,
      });

      if (referrearUser) {
        const referralLevelReferralDetails = await getLevelReferralDetails(
          referrearUser.walletAddress,
          currentLevel
        );

        const convertedReferralDetails = JSON.parse(
          JSON.stringify(referralLevelReferralDetails, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        );
        if (!convertedReferralDetails?.data === undefined) {
          throw new Error("No data found");
        }
        console.log("Details for current slot", convertedReferralDetails.data);
        const referralSlot = await Slot.findOneAndUpdate(
          { userId: referrearUser?.userId, slot: currentLevel }, // Filter by userId and slot
          {
            userId: referrearUser?.userId,
            walletAddress: referrearUser.walletAddress,
            slot: currentLevel,
            data: convertedReferralDetails.data,
          }, // Data to update or insert
          { new: true, upsert: true } // Return the updated document and create if it doesn't exist
        );
        console.log("Referral Slot information upserted successfully");
      }
    }

    return slot;
  } catch (error) {
    console.error("Error inserting/updating slot info:", error.message);
    throw error;
  }
};

const upgradeAnotherUserSlot = async (userAddress, level) => {
  try {
    const user = await User.findOne({ walletAddress: userAddress });
    if (!user) {
      throw new Error("User not found");
    }
    console.log("going to upgrdate user slot");

    console.log("level", level);
    console.log("userAddress", userAddress);

    const upgradeUser = await upgradeUserSlot(userAddress, level);

    const currentSlot = await getUserSlot(userAddress);
    const activeSlot = currentSlot?.activeSlot;
    user.currentActiveSlot = activeSlot;
    await user.save();

    const currentLevel = Number(level);
    const levelReferralDetails = await getLevelReferralDetails(
      userAddress,
      currentLevel
    );
    const convertedDetails = JSON.parse(
      JSON.stringify(levelReferralDetails, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    if (!convertedDetails?.data === undefined) {
      throw new Error("No data found");
    }
    const slot = await Slot.findOneAndUpdate(
      { userId: user?.userId, slot: currentLevel }, // Filter by userId and slot
      {
        userId: user?.userId,
        walletAddress: userAddress,
        slot: currentLevel,
        data: convertedDetails.data,
      }, // Data to update or insert
      { new: true, upsert: true } // Return the updated document and create if it doesn't exist
    );
    console.log("Slot information upserted successfully", slot?._id);

    if (user.referredBy !== null) {
      const referrearUser = await User.findOne({
        userId: user.referredBy,
      });
      if (referrearUser) {
        const referralLevelReferralDetails = await getLevelReferralDetails(
          referrearUser.walletAddress,
          currentLevel
        );
        const convertedReferralDetails = JSON.parse(
          JSON.stringify(referralLevelReferralDetails, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        );
        if (!convertedReferralDetails?.data === undefined) {
          throw new Error("No data found");
        }
        const referralSlot = await Slot.findOneAndUpdate(
          { userId: referrearUser?.userId, slot: currentLevel }, // Filter by userId and slot
          {
            userId: referrearUser?.userId,
            walletAddress: referrearUser.walletAddress,
            slot: currentLevel,
            data: convertedReferralDetails.data,
          }, // Data to update or insert
          { new: true, upsert: true } // Return the updated document and create if it doesn't exist
        );
        console.log(
          "Referral Slot information upserted successfully",
          referralSlot?._id
        );
      }
    }
    return slot;
  } catch (error) {
    console.log("Error inserting/updating slot info:", error.message);
    console.log(error);
    throw error;
  }
};

module.exports = { insertSlotInfo, upgradeAnotherUserSlot };
