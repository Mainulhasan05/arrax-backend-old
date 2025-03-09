const {
  getUserSlot,
  getLevelReferralDetails,
} = require("../controllers/bookingContractController");
const Slot = require("../models/Slot");
const User = require("../models/User");
const { insertSlotInfo } = require("./slotService");

const testBlockchainFormatService = async () => {
  try {
    const users = await User.find({}); // Fetch all users
    const result = [];

    for (const user of users) {
      console.log(`Processing slots for user: ${user.walletAddress}`);

      const currentSlot = await getUserSlot(user.walletAddress); // Call provided function
      const activeSlot = currentSlot?.activeSlot || 0;

      const slotDetails = [];

      // Process each active slot
      for (let i = 0; i < activeSlot; i++) {
        // const levelReferralDetails = await getLevelReferralDetails(
        //   user.walletAddress,
        //   i + 1
        // );
        await insertSlotInfo({ user: user.walletAddress, level: i + 1 });

        // Push formatted slot data
        // slotDetails.push({
        //   slot: i + 1,
        //   data: {
        //     referralCount: levelReferralDetails?.data?.referralCount.toString(),
        //     recycleCount: levelReferralDetails?.data?.recycleCount.toString(),
        //     slotTransactions:
        //       levelReferralDetails?.data?.slotTransactions.toString(),
        //     isUpgraded: levelReferralDetails?.data?.isUpgraded,
        //     isActive: levelReferralDetails?.data?.isActive,
        //   },
        // });
      }

      // Push formatted data for the user
      result.push({
        success: true,
        activeSlot: activeSlot,
        slotDetails: slotDetails,
      });
    }

    // Format the final response
    return {
      success: true,
      message: "Slot and sub-slots found.",
      data: result,
    };
  } catch (error) {
    console.error("Error processing users and their slots:", error);
    throw error;
  }
};

module.exports = { testBlockchainFormatService };
