const { ethers, JsonRpcProvider } = require("ethers");
const {
  registrationContractABI,
  contractAddress,
} = require("../config/contractConfig");
const dotenv = require("dotenv");
dotenv.config();
const provider = new JsonRpcProvider(process.env.APP_RPC);

const getContract = () => {
  try {
    // console.log(contractAddress,registrationContractABI);
    const contract = new ethers.Contract(
      contractAddress,
      registrationContractABI,
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
const pauseContract = async () => {
  try {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = getContract().connect(wallet);

    const transaction = await contract.pauseContract();

    return {
      success: true,
      message: "Contract paused successfully",
      data: transaction,
    };
  } catch (error) {
    console.error("Error in pauseContract:", error);
    return {
      success: false,
      message: "Failed to pause contract",
      error: error.message,
    };
  }
};

const unpauseContract = async () => {
  try {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = getContract().connect(wallet);

    const transaction = await contract.unpauseContract();

    return {
      success: true,
      message: "Contract unpaused successfully",
      data: transaction,
    };
  } catch (error) {
    console.error("Error in unpauseContract:", error);
    return {
      success: false,
      message: "Failed to unpause contract",
      error: error.message,
    };
  }
};

const getRegistrationStatus = async () => {
  try {
    const contract = getContract();
    const data = await contract.paused();
    console.log(data);
    return {
      success: true,
      status: data,
    };
  } catch (error) {
    console.error("Error in getRegistrationStatus:", error);
    return {
      success: false,
      message: "Getting Error Status failed",
      error: error.message,
    };
  }
};

const getUserByReferrerId = async (referrerId) => {
  try {
    const contract = getContract();
    const user = await contract.getUserByReferrerId(referrerId);

    if (!user || user === "0x") {
      return {
        success: false,
        message: "Referrer not found",
        data: null,
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error in getUserByReferrerId:", error);
    return {
      success: false,
      message: "Referrer lookup failed",
      error: error.message,
    };
  }
};

const getUserByUserId = async (userId) => {
  try {
    const contract = getContract();
    const user = await contract.getUserByUserId(userId);

    if (!user || user === "0x") {
      return {
        success: false,
        message: "User ID not found",
        data: null,
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error in getUserByUserId:", error);
    return {
      success: false,
      message: "User ID lookup failed",
      error: error.message,
    };
  }
};

const getUserInfo = async (userAddress) => {
  try {
    const contract = getContract();
    const user = await contract.getUserInfo(userAddress);

    if (!user || user === "0x") {
      return {
        success: false,
        message: "User not found",
        data: null,
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    return {
      success: false,
      message: "User lookup failed",
      error: error.message,
    };
  }
};

const getUserReferrals = async (userAddress) => {
  try {
    const contract = getContract();
    const referrals = await contract.getUserReferrals(userAddress);

    if (!referrals) {
      return {
        success: false,
        message: "No referrals found",
        data: [],
      };
    }

    return {
      success: true,
      data: referrals,
    };
  } catch (error) {
    console.log("Error in getUserReferrals:", error);
    return {
      success: false,
      message: "Referrals lookup failed",
      error: error.message,
    };
  }
};

const getTotalUsers = async () => {
  try {
    const contract = getContract();
    const total = await contract.totalUsers();

    return {
      success: true,
      data: total,
    };
  } catch (error) {
    console.error("Error in getTotalUsers:", error);
    return {
      success: false,
      message: "Total users lookup failed",
      error: error.message,
    };
  }
};

const getRegistrationFee = async () => {
  try {
    const contract = getContract();
    const fee = await contract.registrationFee();

    return {
      success: true,
      data: fee,
    };
  } catch (error) {
    console.log("Error in getRegistrationFee:", error);
    return {
      success: false,
      message: "Registration fee lookup failed",
      error: error.message,
    };
  }
};

const getFeeCollector = async () => {
  try {
    const contract = getContract();
    const collector = await contract.feeCollector();

    if (!collector) {
      return {
        success: false,
        message: "Fee collector not found",
        data: null,
      };
    }

    return {
      success: true,
      data: collector,
    };
  } catch (error) {
    console.log("Error in getFeeCollector:", error);
    return {
      success: false,
      message: "Fee collector lookup failed",
      error: error.message,
    };
  }
};

const getPaymentToken = async () => {
  try {
    const contract = getContract();
    const token = await contract.paymentToken();

    if (!token) {
      return {
        success: false,
        message: "Payment token not found",
        data: null,
      };
    }

    return {
      success: true,
      data: token,
    };
  } catch (error) {
    console.log("Error in getPaymentToken:", error);
    return {
      success: false,
      message: "Payment token lookup failed",
      error: error.message,
    };
  }
};

const isPaused = async () => {
  try {
    const contract = getContract();
    const paused = await contract.paused();

    return {
      success: true,
      data: paused,
    };
  } catch (error) {
    console.log("Error in isPaused:", error);
    return {
      success: false,
      message: "Contract pause status check failed",
      error: error.message,
    };
  }
};

module.exports = {
  getUserByReferrerId,
  getUserByUserId,
  getUserInfo,
  getUserReferrals,
  getTotalUsers,
  getRegistrationFee,
  getFeeCollector,
  getPaymentToken,
  isPaused,
  pauseContract,
  unpauseContract,
};
