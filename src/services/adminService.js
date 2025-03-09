const User = require("../models/User");
const Slot = require("../models/Slot");
const Transaction = require("../models/Transaction");
const {
  isPaused,
  pauseContract,
  unpauseContract,
} = require("../controllers/RegisterationContractController");
const {
  isPurchasePaused,
  purchasePause,
  purchaseUnpause,
  getUserSlot,
  getBSCFees,
  changeSlotFees,
} = require("../controllers/bookingContractController");
// take walletAddress and fullName also page and limit
const getAllUsersService = async (
  walletAddress,
  fullName,
  page = 1,
  limit = 30
) => {
  const skip = (page - 1) * limit;

  // Build the search criteria conditionally
  const searchCriteria = {};
  if (fullName) {
    searchCriteria.fullName = { $regex: fullName, $options: "i" };
  }
  if (walletAddress) {
    searchCriteria.walletAddress = { $regex: walletAddress, $options: "i" };
  }

  // Count total users matching the search criteria
  const totalUsers = await User.countDocuments(
    Object.keys(searchCriteria).length ? { $or: [searchCriteria] } : {}
  );

  const totalPages = Math.ceil(totalUsers / limit);
  const currentPage = page;

  // Find users with pagination and search criteria
  const users = await User.find(
    Object.keys(searchCriteria).length ? { $or: [searchCriteria] } : {}
  )
    .skip(skip)
    .limit(limit);

  return { users, currentPage, totalPages, totalUsers };
};

// single userId will be passed, return everything about the user
const getUserByIdService = async (userId) => {
  try {
    // Fetch user details

    const user = await User.findOne({ userId });
    const slotInfo = await getUserSlot(user?.walletAddress);
    const activeSlot = slotInfo.activeSlot;
    console.log(activeSlot, "activeSlot for userId", userId);

    // Fetch slots with their corresponding subslots
    const slotDetails = await Slot.find({ userId }).sort({ slot: 1 });

    // Fetch last 10 transactions where fromId or receiverId matches userId
    const transactions = await Transaction.find({
      $or: [{ fromId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 }) // Sort by most recent
      .limit(10); // Limit to the last 10

    // Combine all data into a single response
    return {
      user,
      slots: slotDetails,
      activeSlot,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching user dashboard data:", error);
    throw new Error("Error fetching user dashboard data");
  }
};

//
const getSettingsStatus = async () => {
  try {
    const isRegistrationPaused = await isPaused();
    const isPurchasingPaused = await isPurchasePaused();
    const fees = await getBSCFees();

    console.log(fees, "fees");

    return {
      isRegistrationPaused: isRegistrationPaused.data,
      isPurchasingPaused: isPurchasingPaused.data,
      fees: fees.data.toString(), // Convert BigInt to string
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw new Error("Error fetching settings");
  }
};

// updateRegistraion
const updateRegistrationStatus = async (status) => {
  // true or false

  if (status) {
    await unpauseContract();
  } else {
    await pauseContract();
  }
  return true;
};

const updatePurchasingStatus = async (status) => {
  console.log(status);
  // true or false
  if (status) {
    await purchaseUnpause();
  } else {
    await purchasePause();
  }
  return true;
};
// changeSlotFees
const updateFees = async (fees) => {
  await changeSlotFees(fees);
  return true;
};
module.exports = {
  getAllUsersService,
  getUserByIdService,
  getSettingsStatus,
  updateRegistrationStatus,
  updatePurchasingStatus,
  updateFees,
};
