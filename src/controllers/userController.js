const {
  registerOwner,
  loginOrRegisterUser,
  getUserById,
  getGenerationLevels,
  processImage,
  getSlotsWithSubSlots,
} = require("../services/userService");
const sendResponse = require("../utils/sendResponse");

const handleOwnerRegistration = async (req, res) => {
  try {
    const { walletAddress, fullName } = req.body;

    if (!walletAddress || !fullName) {
      return sendResponse(
        res,
        400,
        false,
        "Wallet address and full name are required.",
        null
      );
    }

    const result = await registerOwner({ walletAddress, fullName });
    return sendResponse(
      res,
      201,
      true,
      "Owner registration successful.",
      result
    );
  } catch (error) {
    return sendResponse(res, 500, false, error.message, null);
  }
};

const handleLoginOrRegistration = async (req, res) => {
  try {
    const { userId, walletAddress, fullName, referredBy } = req.body;

    if (!walletAddress) {
      return sendResponse(res, 400, false, "Wallet address is required.", null);
    }

    const result = await loginOrRegisterUser({
      userId,
      walletAddress,
      fullName,
      referredBy,
    });

    if (result.isNewUser) {
      return sendResponse(
        res,
        201,
        true,
        "User registration successful.",
        result
      );
    } else {
      return sendResponse(res, 200, true, "Login successful.", result);
    }
  } catch (error) {
    return sendResponse(res, 500, false, error.message, null);
  }
};

const handleGetUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);

    if (!user) {
      return sendResponse(res, 404, false, "User not found.", null);
    }

    return sendResponse(res, 200, true, "User found.", user);
  } catch (error) {
    return sendResponse(res, 500, false, error.message, null);
  }
};

const getUserGenerationLevels = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const levels = await getGenerationLevels(parseInt(userId, 10));

    return res.status(200).json({ levels });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    const { fullName } = req.body;
    let processedImagePath = null;

    // Pass fullName along with image processing
    processedImagePath = await processImage(
      req.file ? req.file.buffer : null,
      req.user.userId,
      fullName
    );

    return sendResponse(res, 200, true, "Profile updated successfully", {
      image: processedImagePath,
      fullName: fullName || req.user.fullName,
    });
  } catch (error) {
    console.error(error.message);
    return sendResponse(res, 500, false, error.message, null);
  }
};

// getSlotWithSubSlots make controller and receive userId from params
const handleSlotWithSubSlots = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentSlot = await getSlotsWithSubSlots(userId);

    return sendResponse(
      res,
      200,
      true,
      "Slot and sub-slots found.",
      currentSlot
    );
  } catch (error) {
    return sendResponse(res, 500, false, error.message, null);
  }
};

module.exports = {
  handleOwnerRegistration,
  handleLoginOrRegistration,
  handleGetUserById,
  getUserGenerationLevels,
  uploadImage,
  handleSlotWithSubSlots,
};
