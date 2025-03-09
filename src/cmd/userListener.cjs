require("dotenv").config();
const { ethers, JsonRpcProvider } = require("ethers");
const contractAdress = process.env.NEXT_PUBLIC_REGISTRATION_CONTRACT_ADDRESS;
const contractABI = require("../../ABI/registration.json");
const rpcURL = process.env.APP_RPC;
const provider = new JsonRpcProvider(rpcURL);
const User = require("../models/User");

const { loginOrRegisterUser } = require("../services/userService");
const {
  getUserInfo,
} = require("../controllers/RegisterationContractController");

const BN = require("bn.js");

async function userListener() {
  const contract = new ethers.Contract(contractAdress, contractABI, provider);

  console.log("Listening for UserRegistered events...");
  contract.on(
    "UserRegistered",
    async (
      userAddress,
      userId,
      registrationTime,
      referrerAddress
      // fullName
    ) => {
      console.log("userAddress", userAddress);
      console.log("userId", userId);
      console.log("Normal userId", new BN(userId).toNumber());

      console.log("registrationTime", registrationTime);
      console.log("referrerAddress", referrerAddress);
      const userName = await contract.getUserByUserId(userId); // userName[6]
      const referreInfo = await getUserInfo(referrerAddress); // admin reffer id
      console.log("referreInfo", referreInfo);
      const reffererId = Number(referreInfo.data[0]) || Number(referreInfo[0]);
      console.log(
        "reffererId",
        reffererId,
        referreInfo.data[0],
        referreInfo[0]
      );
      fullName = userName[6];
      console.log("fullName", fullName);
      try {
        const { user, token, isNewUser } = await loginOrRegisterUser({
          userId: new BN(userId).toNumber(),
          walletAddress: userAddress,
          fullName,
          referredBy: reffererId,
          referrerAddress,
        });

        console.log("user", user);
      } catch (error) {
        console.error("Error saving to MongoDB:", error);
      }
    }
  );
}

module.exports = userListener;

// userAddress 0x6a11b91954DC3125Ae09646404E846315CD06C3F
// userId 4n
// registrationTime 1736882448n
// referrerAddress 0x0E6567ab9229f846FC8061874399d8a8703eE45c
