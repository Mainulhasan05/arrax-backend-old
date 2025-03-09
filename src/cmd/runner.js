require("dotenv").config();
const cron = require("node-cron");
const { ethers, JsonRpcProvider } = require("ethers");
const contractAddress = process.env.NEXT_PUBLIC_REGISTRATION_CONTRACT_ADDRESS;
const contractABI = require("../../ABI/registration.json");
const { loginOrRegisterUser } = require("../services/userService");
const rpcURL = process.env.APP_RPC;
const provider = new JsonRpcProvider(rpcURL);

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

let count = 0;

const handleMissingUsers = async () => {
  try {
    const contract = getContract();
    const totalUsers = await contract.totalUsers();
    console.log("Total Users:", totalUsers);

    for (let i = Number(totalUsers) - 100; i <= totalUsers; i++) {
      const user = await contract.getUserByUserId(i);
      if (user) {
        count++;
        console.log("userId", i);
        // console.log({
        //   walletAddress: user[0],
        //   userId: i,
        //   fullName: user[6] ? user[6] : "Unknown",
        //   referredBy: user[1].toString(),
        //   referrerAddress: user[2],
        // });
        try {
          await loginOrRegisterUser({
            walletAddress: user[0],
            userId: i,
            fullName: user[6] ? user[6] : "Unknown",
            referredBy: user[1].toString(),
            referrerAddress: user[2],
          });
          console.log("user count", count);
        } catch (error) {
          console.log("Errrrrr", error.message);
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const scheduleUserSync = () => {
  const cronSchedule = "0 * * * *";
  try {
    if (!cron.validate(cronSchedule)) {
      throw new Error("Invalid cron schedule expression");
    }

    const job = cron.schedule(
      cronSchedule,
      async () => {
        console.log(`Starting scheduled sync at ${new Date().toISOString()}`);
        try {
          await handleMissingUsers();
        } catch (error) {
          console.error("Scheduled sync failed:", error.message);
        }
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );

    console.log("Running initial sync...");
    handleMissingUsers().catch((error) => {
      console.error("Initial sync failed:", error.message);
    });

    return job;
  } catch (error) {
    console.error("Failed to schedule cron job:", error.message);
    throw error;
  }
};

module.exports = scheduleUserSync;
// module.exports = { handleMissingUsers }
