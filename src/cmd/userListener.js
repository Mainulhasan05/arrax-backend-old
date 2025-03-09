require("dotenv").config();
const { ethers, JsonRpcProvider } = require("ethers");
const BN = require("bn.js");
const contractABI = require("../../ABI/registration.json");
const { loginOrRegisterUser } = require("../services/userService");
const {
  getUserInfo,
} = require("../controllers/RegisterationContractController");

const contractAddress = process.env.NEXT_PUBLIC_REGISTRATION_CONTRACT_ADDRESS;
const rpcURL = process.env.APP_RPC;
const provider = new JsonRpcProvider(rpcURL);

async function userListener() {
  try {
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    console.log("Listening for UserRegistered events...");
    contract.on(
      "UserRegistered",
      async (userAddress, userId, registrationTime, referrerAddress) => {
        console.log("🔔 Event Received: UserRegistered");
        // console.log("userAddress:", userAddress);
        // console.log("userId:", userId.toString());
        // console.log("registrationTime:", registrationTime.toString());
        // console.log("referrerAddress:", referrerAddress);

        // Convert userId to a normal number
        let numericUserId;
        try {
          numericUserId = new BN(userId).toNumber();
        } catch (error) {
          console.error("❌ Error converting userId to number:", error);
          return;
        }

        // Fetch user details from contract
        let userData;
        try {
          userData = await contract.getUserByUserId(userId);
          if (!userData || userData.length < 7) {
            throw new Error("Invalid user data returned from contract.");
          }
          // console.log("✅ Fetched user data:", userData);
        } catch (error) {
          console.error("❌ Error fetching user data from contract:", error);
          return;
        }

        // Fetch referrer information
        let referrerInfo;
        try {
          referrerInfo = await getUserInfo(referrerAddress);
          // console.log("✅ Fetched referrer info:", referrerInfo);
        } catch (error) {
          console.error("❌ Error fetching referrer info:", error);
          referrerInfo = { data: [0] }; // Default to no referrer
        }

        const referrerId =
          Number(referrerInfo?.data?.[0] || referrerInfo?.[0]) || 0;
        const fullName = userData[6];

        console.log("Processed Data:");
        console.log("➡️ Numeric userId:", numericUserId);
        console.log("➡️ Full Name:", fullName);
        console.log("➡️ Referrer ID:", referrerId);

        // Save user to database
        try {
          const { user, token, isNewUser } = await loginOrRegisterUser({
            userId: numericUserId,
            walletAddress: userAddress,
            fullName,
            referredBy: referrerId,
            referrerAddress,
          });

          console.log("✅ User saved:", user?.userId);
        } catch (error) {
          console.error("❌ Error saving user to database:", error);
        }
      }
    );
  } catch (error) {
    console.error("❌ Error initializing event listener:", error);
  }
}

module.exports = userListener;
