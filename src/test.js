const connectDB = require("./config/db");
const {
  getUserByUserId,
  getRegistrationFee,
  getTotalUsers,
  getUserInfo,
  getUserReferrals,
  isPaused,
} = require("./controllers/RegisterationContractController");
const {
  getSlotInfo,
  getUserIncome,
  getCurrentSlot,
  getUserSlot,
  getSlotData,
} = require("./controllers/bookingContractController");
const { loginOrRegisterUser } = require("./services/userService");

const print = async () => {
  console.log(await isPaused());
  // console.log(await getSlotData(0));
};

print();
// NEXT_PUBLIC_REGISTRATION_CONTRACT_ADDRESS=0x4E9c3eD2A184402eA293526aa12Af0b9Eb82BbcF
// NEXT_PUBLIC_MATRIX_CONTRACT_ADDRESS=0xdEDb0597d11Fd7219cff3423906D92b10B1ABFA8