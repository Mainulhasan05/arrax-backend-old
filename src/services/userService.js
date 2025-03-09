require("dotenv").config();
const sharp = require("sharp");
const { ethers, JsonRpcProvider } = require("ethers");
const contractAddress = process.env.NEXT_PUBLIC_REGISTRATION_CONTRACT_ADDRESS;
const BN = require("bn.js");
const rpcURL = process.env.APP_RPC;
const provider = new JsonRpcProvider(rpcURL);

const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Slot = require("../models/Slot");
const { generateToken } = require("./tokenService");
const {
  getUserSlot,
  getUserActiveSlots,
} = require("../controllers/bookingContractController");
const contractABI = require("../../ABI/registration.json");
// const getNextSequence = require("../utils/getNextSequence");
const { getUserIncome } = require("../controllers/bookingContractController");
const {
  getUserInfo,
  getUserByUserId,
} = require("../controllers/RegisterationContractController");
// const { insertOrderInfo } = require("./orderService");

const getContract = () => {
  try {
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    return contract;
  } catch (error) {
    console.log("Error initializing contract:", error);
    return {
      success: false,
      message: "Contract initialization failed",
      error: error.message,
    };
  }
};

const registerOwner = async ({ walletAddress, fullName }) => {
  const existingOwner = await User.findOne({ isOwner: true });
  if (existingOwner) {
    throw new Error("An owner already exists. Only one owner is allowed.");
  }
  const user = await User.create({
    fullName,
    walletAddress,
    referredBy: null, // No referrer for the owner
    isOwner: true,
    roles: ["user", "admin"],
    userId: 1, // Set userId to 1 for the owner
  });

  const token = generateToken({
    userId: user.userId,
    walletAddress: user.walletAddress,
    roles: user?.roles,
  });

  return { user, token };
};

// {
//   userId: new BN(userId).toNumber(),
//   walletAddress: userAddress,
//   fullName,
//   referredBy: reffererId,
//   referrerAddress,
// }
const loginOrRegisterUser = async ({
  userId,
  walletAddress,
  fullName,
  referredBy,
  referrerAddress,
}) => {
  try {
    let user = await User.findOne({ walletAddress });

    if (user) {
      const token = generateToken({
        userId: user.userId,
        walletAddress: user.walletAddress,
        roles: user?.roles,
      });

      const incomeData = await getUserIncome(walletAddress);
      user.income = {
        ...user.income,
        ...incomeData.data,
      };

      await user.save();
      console.log("User Logged in", user.userId);

      return { user, token, isNewUser: false };
    } else {
      try {
        console.log("going to register user", walletAddress);
        const userInfo = await getUserInfo(walletAddress);
        const userData = userInfo.data;
        const fullNameGot = userData[6];
        const userIdGot = new BN(userData[0]).toNumber();
        const referrerBy = new BN(userData[1]).toNumber();
        const referrerAddress = userData[2];

        console.log("user with these data from blockchain", {
          userIdGot,
          fullNameGot,
          walletAddress,
          referrerBy,
          referrerAddress,
        });

        user = await User.create({
          userId: userIdGot,
          fullName: fullNameGot,
          walletAddress,
          referredBy: referrerBy,
          referrerAddress,
          isOwner: false,
          currentActiveSlot: 0,
        });

        const token = generateToken({
          userId: user.userId,
          walletAddress: user.walletAddress,
        });
        const referrer = await User.findOne({ userId: referrerBy });
        if (referrer) {
          referrer.totalTeam += 1;
          referrer.totalPartners += 1;
          referrer.dailyTeam += 1;
          referrer.dailyPartners += 1;
          updateReferrerTeam(referrerBy, 1);
          await referrer.save();
        }
        handleMissingUsers();
        return { user, token, isNewUser: true };
      } catch (error) {
        throw new Error(error.message);
      }
    }
  } catch (error) {
    console.error("Error registering user:", error.message);
    throw error;
  }
};
const handleMissingUsers = async () => {
  const missingUsers = await getMissingUserIds();
  console.log("missing users", missingUsers);
  if (missingUsers.length > 0) {
    for (const userId of missingUsers) {
      const userAddress = await getUserByUserId(userId);

      const userInfo = await getUserInfo(userAddress.data[0]);

      const userData = userInfo.data;
      const fullNameGot = userData[6];
      const userIdGot = new BN(userData[0]).toNumber();
      const referrerBy = new BN(userData[1]).toNumber();
      const referrerAddress = userData[2];

      // console.log("user with these data from blockchain", {
      //   userIdGot,
      //   fullNameGot,
      //   walletAddress: userAddress.data[0],
      //   referrerBy,
      //   referrerAddress,
      // });

      const user = await User.create({
        userId: userIdGot,
        fullName: fullNameGot,
        walletAddress: userAddress.data[0],
        referredBy: referrerBy,
        referrerAddress,
        isOwner: false,
        currentActiveSlot: 0,
      });
      console.log("inserted one missing user with ", user?.userId);

      const referrer = await User.findOne({ userId: referrerBy });
      if (referrer) {
        referrer.totalTeam += 1;
        referrer.totalPartners += 1;
        referrer.dailyTeam += 1;
        referrer.dailyPartners += 1;
        updateReferrerTeam(referrerBy, 1);
        await referrer.save();
      }
    }
  }
};
const getMissingUserIds = async () => {
  const users = await User.find();
  const userIds = users.map((user) => user.userId);

  const missingUsers = [];
  for (let i = 1; i <= userIds.length; i++) {
    if (!userIds.includes(i)) {
      missingUsers.push(i);
    }
  }
  return missingUsers;
};

const updateTeamsAndPartners = async () => {
  // Fetch all users from the database
  const users = await User.find({});

  for (const user of users) {
    console.log("Updating Teams and Partners for user", user.userId);
    // Count totalTeam (Direct Referrals)
    const totalPartners = await User.countDocuments({
      referredBy: user.userId,
    });
    console.log("total team", totalPartners);

    // Get all partners recursively
    const allPartners = await getAllPartners(user.userId);
    const totalTeam = allPartners.length;

    // Update user document
    await User.updateOne(
      { userId: user.userId },
      {
        $set: {
          totalTeam,
          totalPartners,
        },
      }
    );
    console.log("Update Teams and Partners for user", user.userId);
  }
};

const getAllPartners = async (userId) => {
  const directReferrals = await User.find({ referredBy: userId }).select(
    "userId"
  );
  const directIds = directReferrals.map((user) => user.userId);

  let allPartners = [...directIds];

  // Recursively find partners for each direct referral
  for (let directId of directIds) {
    const subPartners = await getAllPartners(directId);
    allPartners = [...allPartners, ...subPartners];
  }

  // Return unique userIds to avoid duplicates
  return [...new Set(allPartners)];
};
const updateReferrerTeam = async (userId, team) => {
  // loop recursively through the referredBy, and increase everyone's team count, until you reach the owner where referredBy is null
  let user = await User.findOne({ userId });
  while (user.referredBy !== null) {
    user = await User.findOne({ userId: user.referredBy });
    user.totalTeam += team;
    user.dailyPartners += team;
    await user.save();
  }
};

// get user information by userId
const getUserById = async (userId) => {
  const user = await User.findOne({ userId });
  const incomeData = await getUserIncome(user?.walletAddress);
  user.income = {
    ...user.income,
    ...incomeData.data,
  };
  console.log("updated income for user", user.userId);

  await user.save();
  return user;
};

const getGenerationLevels = async (userId) => {
  const levels = Array.from({ length: 10 }, (_, i) => ({
    level: i + 1,
    count: 0,
    active: 0,
    inactive: 0,
    users: [],
  }));

  let currentUserIds = [userId]; // Start with the given user
  let visitedUserIds = new Set(); // To avoid processing the same user multiple times

  for (let levelIndex = 0; levelIndex < 10; levelIndex++) {
    if (currentUserIds.length === 0) break; // Stop if there are no more users at the current level

    const referrals = await User.find({
      referredBy: { $in: currentUserIds },
    }).lean();

    const levelData = levels[levelIndex];

    for (const user of referrals) {
      if (!visitedUserIds.has(user.userId)) {
        visitedUserIds.add(user.userId);
        levelData.users.push({
          userId: user.userId,
          fullName: user.fullName,
          walletAddress: user.walletAddress,
        });

        if (user.isActive) {
          levelData.active++;
        } else {
          levelData.inactive++;
        }
      }
    }

    levelData.count = levelData.users.length;
    currentUserIds = referrals.map((user) => user.userId); // Move to the next level
  }

  return levels;
};

// Ensure the uploads directory exists or create it
const uploadDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const processImage = async (buffer, userId, fullName) => {
  try {
    let processedPath = null;

    if (userId == 1) {
      return "Fuck you";
    }

    if (buffer) {
      // Generate processed image path
      processedPath = path.join(uploadDir, `processed-${Date.now()}.webp`);

      // Use Sharp to process the image
      await sharp(buffer)
        .resize(800) // Resize image to 800px width (maintaining aspect ratio)
        .toFormat("webp") // Convert to webp format
        .toFile(processedPath);
    }

    const publicUrl = processedPath
      ? `${process.env.APP_URL}/uploads/${path.basename(processedPath)}`
      : null;

    // Update user data in DB
    const updateData = {};
    if (publicUrl) updateData.image = publicUrl;
    if (fullName) updateData.fullName = fullName;

    if (Object.keys(updateData).length > 0) {
      await User.updateOne({ userId }, { $set: updateData });
    }

    return publicUrl;
  } catch (error) {
    console.error("Error processing image:", error.message);
    throw new Error("Failed to process image.");
  }
};

const getSlotsWithSubSlots = async (userId) => {
  try {
    const user = await User.findOne({ userId: parseInt(userId) });

    if (!user) {
      throw new Error("User not found");
    }

    const slotInfo = await getUserActiveSlots(user?.walletAddress);
    const maxSlotValue =
      slotInfo.data.slots.length > 0
        ? Math.max(...slotInfo.data.slots.map(Number))
        : 0;
    const currentSlot = {
      success: true,
      activeSlot: maxSlotValue,
    };

    // const slotDetails = [];
    const slotDetails = await Slot.find({ userId: user.userId }).sort({
      slot: 1,
    });

    // Optionally, add slotDetails to currentSlot for reference
    currentSlot.slotDetails = slotDetails;

    return currentSlot;
  } catch (error) {
    console.error("Error fetching slots and subSlots:", error);
    throw error;
  }
};

module.exports = {
  registerOwner,
  loginOrRegisterUser,
  getUserById,
  getGenerationLevels,
  processImage,
  getSlotsWithSubSlots,
  getMissingUserIds,
  getAllPartners,
  updateTeamsAndPartners,
};
