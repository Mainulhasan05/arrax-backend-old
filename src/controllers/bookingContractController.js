const { ethers, JsonRpcProvider } = require("ethers");
const {
  matrixProABI,
  bookingContractAddress,
  tokenABI,
  tokenContractAddress,
} = require("../config/contractConfig");
const dotenv = require("dotenv");
dotenv.config();
const provider = new JsonRpcProvider(process.env.APP_RPC);
const getContract = () => {
  try {
    const contract = new ethers.Contract(
      bookingContractAddress,
      matrixProABI,
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

const getCurrentSlot = async (userAddress) => {
  try {
    const contract = getContract();
    const slotInfo = await contract.getCurrentSlotInfo(userAddress);
    // console.log("getCurrentSlot", {
    //   currentActiveSlot: slotInfo[0].toString(),
    //   currentPosition: slotInfo[1].toString(),
    //   entryTime: slotInfo[2].toString(),
    //   matrixSize: slotInfo[3].toString(),
    //   recycleCount: slotInfo[4].toString(),
    //   timeInPosition: slotInfo[5].toString(),
    // });
    return {
      success: true,
      data: {
        currentActiveSlot: slotInfo[0].toString(),
        currentPosition: slotInfo[1].toString(),
        entryTime: slotInfo[2].toString(),
        matrixSize: slotInfo[3].toString(),
        recycleCount: slotInfo[4].toString(),
        timeInPosition: slotInfo[5].toString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get current slot info: ${error.message}`,
    };
  }
};
const getBSCFees = async () => {
  // console.log("BSC FEES");
  try {
    const contract = getContract();
    const slotFees = await contract.BSC_FEE();

    return {
      success: true,
      data: slotFees,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get  slot fees: ${error.message}`,
    };
  }
};

const getUserActiveSlots = async (userAddress) => {
  try {
    const contract = getContract();
    const activeSlots = await contract.getUserActiveSlots(userAddress);

    return {
      success: true,
      data: {
        slots: activeSlots[0].map((slot) => slot.toString()),
        positions: activeSlots[1].map((pos) => pos.toString()),
        entryTimes: activeSlots[2].map((time) => time.toString()),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get user active slots: ${error.message}`,
    };
  }
};

const getUserSlot = async (userAddress) => {
  try {
    const contract = getContract();
    const activeSlots = await contract.userSlots(userAddress);

    return {
      success: true,
      activeSlot: Number(activeSlots[0]),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get user active slots: ${error.message}`,
    };
  }
};

const getSlotData = async (level) => {
  try {
    const contract = getContract();
    const data = await contract.slots(level);

    // console.log("getSlotData", {
    //   level: data[0].toString(),
    //   recycleCount: data[2],
    //   transactions: data[3].toString(),
    // });
    return {
      success: true,
      data: {
        level: data[0].toString(),
        recycleCount: data[2],
        transactions: data[3].toString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to getting slots: ${error.message}`,
    };
  }
};

const getAdminStats = async () => {
  try {
    const contract = getContract();
    const data = await contract.getAdminStats();

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to getting slots: ${error.message}`,
    };
  }
};

const getUserIncome = async (userAddress) => {
  try {
    const contract = getContract();
    const income = await contract.getUserIncomeStats(userAddress);

    return {
      success: true,
      data: {
        total: ethers.formatEther(income[0]),
        levelIncome: ethers.formatEther(income[1]),
        directIncome: ethers.formatEther(income[2]),
        slotIncome: ethers.formatEther(income[3]),
        recycleIncome: ethers.formatEther(income[4]),
        salaryIncome: ethers.formatEther(income[5]),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get income stats: ${error.message}`,
    };
  }
};

const getUserReferralStats = async (userAddress) => {
  try {
    const contract = getContract();
    const stats = await contract.getUserReferralStats(userAddress);

    return {
      success: true,
      data: {
        totalReferrals: stats[0].toString(),
        activeReferrals: stats[1].toString(),
        totalMatrixEntries: stats[2].toString(),
        activeMatrixPositions: stats[3].toString(),
        totalRecycles: stats[4].toString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get referral stats: ${error.message}`,
    };
  }
};

const getMatrixInfo = async (level) => {
  try {
    const contract = getContract();
    const info = await contract.getMatrixInfo(level);
    // console.log("getMatrixInfo", info);
    return {
      success: true,
      data: {
        currentSize: info[0].toString(),
        currentMatrix: info[1],
        totalTransactions: info[2].toString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get matrix info: ${error.message}`,
    };
  }
};

const getUserStats = async (address) => {
  try {
    const contract = getContract();
    const info = await contract.userStats(address);
    // console.log("getUserStats", {
    //   totalReferrals: info[0].toString(),
    //   activeReferrals: info[1],
    //   totalMatrixEntries: info[2].toString(),
    //   activeMatrixPositions: info[3].toString(),
    //   totalRecycles: info[4].toString(),

    // })

    return {
      success: true,
      data: {
        totalReferrals: info[0].toString(),
        activeReferrals: info[1],
        totalMatrixEntries: info[2].toString(),
        activeMatrixPositions: info[3].toString(),
        totalRecycles: info[4].toString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get matrix info: ${error.message}`,
    };
  }
};

// const purchaseSlot = async (userWallet, level) => {
//   try {
//     const contract = getContract();
//     const signer = userWallet.connect(provider);
//     const contractWithSigner = contract.connect(signer);

//     const tx = await contractWithSigner.purchaseSlot(level);
//     const receipt = await tx.wait();

//     return {
//       success: true,
//       data: {
//         transactionHash: receipt.hash,
//         level
//       }
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: `Slot purchase failed: ${error.message}`
//     };
//   }
// };

// const autoUpgrade = async (userWallet) => {
//   try {
//     const contract = getContract();
//     const signer = userWallet.connect(provider);
//     const contractWithSigner = contract.connect(signer);

//     const tx = await contractWithSigner.autoUpgrade();
//     const receipt = await tx.wait();

//     return {
//       success: true,
//       data: {
//         transactionHash: receipt.hash
//       }
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: `Auto upgrade failed: ${error.message}`
//     };
//   }
// };

const upgradeUserSlot = async (userAddress, level) => {
  try {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = getContract().connect(wallet);
    // const contractToken = new ethers.Contract(
    //     tokenContractAddress,
    //     tokenABI,
    //     wallet
    // );
    // const sendTokensFees = await contract.slotPrices(level)
    // console.log("sendTokensFees", sendTokensFees.toString())
    // Check current allowance
    // const allowance = await contractToken.allowance(wallet.address, bookingContractAddress);

    // console.log('Current allowance:', allowance.toString());
    // if (Number(allowance) < Number(sendTokensFees.toString())) {
    //     const approveTx = await contractToken.approve(bookingContractAddress, "1000000000000000000000000000" );
    //     await approveTx.wait();
    //     const approveTx1 = await contractToken.approve(wallet.address, "1000000000000000000000000000");
    //     await approveTx1.wait();
    //     console.log('Approval transaction completed');
    // }
    // console.log(sendTokensFees.toString())
    // console.log("Working")

    const upgradeTx = await contract.upgradeUserSlot(userAddress, level);
    await upgradeTx.wait();

    console.log(
      `User slot upgraded for address: ${userAddress} to level: ${level}`
    );
  } catch (error) {
    console.error("Error during upgrade:", error);
  }
};

const purchasePause = async () => {
  try {
    // const contract = getContract();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = getContract().connect(wallet);
    const transaction = await contract.pause();

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

const purchaseUnpause = async () => {
  try {
    // const contract = getContract()
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = getContract().connect(wallet);
    const transaction = await contract.unpause();
    await transaction.wait();

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

const changeSlotFees = async (feesAmount) => {
  try {
    // const contract = getContract();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = getContract().connect(wallet);
    // const fees = feesAmount * 10 ** 18;

    const transaction = await contract.updateBscFee(feesAmount);
    await transaction.wait();

    return {
      success: true,
      message: "Fees Changed successfully",
      data: transaction,
    };
  } catch (error) {
    console.error("Error in Fees Updation", error);
    return {
      success: false,
      message: "failed fees update",
      error: error.message,
    };
  }
};

const isPurchasePaused = async () => {
  try {
    const contract = getContract();

    const transaction = await contract.paused();

    return {
      success: true,
      message: "Contract Pause Status successfully",
      data: transaction,
    };
  } catch (error) {
    console.error("Error in Paused Status:", error);
    return {
      success: false,
      message: "Failed to Paused Status",
      error: error.message,
    };
  }
};

const getLevelReferralDetails = async (userAddress, level) => {
  try {
    const contract = getContract();

    const details = await contract.getLevelReferralDetails(userAddress, level);

    return {
      success: true,
      message: "Level referral details fetched successfully",
      data: {
        referralCount: details[0],
        recycleCount: details[1],
        slotTransactions: details[2],
        isUpgraded: details[3],
        isActive: details[4],
      },
    };
  } catch (error) {
    console.error("Error fetching level referral details:", error);
    return {
      success: false,
      message: "Failed to fetch level referral details",
      error: error.message,
    };
  }
};

module.exports = {
  getCurrentSlot,
  getUserActiveSlots,
  getUserIncome,
  getUserReferralStats,
  getMatrixInfo,
  getUserSlot,
  getSlotData,
  getUserStats,
  getAdminStats,
  upgradeUserSlot,
  //   purchaseSlot,
  //   autoUpgrade
  purchasePause,
  purchaseUnpause,
  isPurchasePaused,
  getLevelReferralDetails,
  changeSlotFees,
  //   purchaseSlot,
  //   autoUpgrade,
  getBSCFees,
};
