const { getUserIncome } = require("../controllers/bookingContractController");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const BN = require("bn.js");
const insertTransaction = async ({
  user,
  from,
  amount,
  level,
  incomeType,
  transactionHash,
}) => {
  try {
    console.log("Transaction received:", {
      user,
      from,
      amount,
      level,
      incomeType,
      transactionHash,
    });

    const userInfo = await User.findOne({ walletAddress: user });
    if (!userInfo) {
      throw new Error("User not found");
    }

    const fromUser = await User.findOne({ walletAddress: from });
    if (!fromUser) {
      throw new Error("From user not found");
    }

    // Check if a transaction matching the criteria already exists.
    let transaction = await Transaction.findOne({
      receiverId: userInfo.userId,
      fromId: fromUser.userId,
      amount,
      level,
    });

    let isNewTransaction = false;
    if (transaction) {
      console.log("Transaction already exists. Skipping creation.");
    } else {
      console.log("No existing transaction found. Creating a new one.");
      isNewTransaction = true;
      transaction = new Transaction({
        receiverId: userInfo.userId,
        receiver: user,
        from,
        fromId: fromUser.userId,
        amount,
        level,
        incomeType,
        transactionHash,
      });
      await transaction.save();
    }

    // Update income fields only if this is a new transaction.
    if (isNewTransaction) {
      console.log("new transaction");

      if (incomeType === "direct") {
        userInfo.dailyDirectIncome =
          userInfo.dailyDirectIncome + new BN(amount).toNumber();
        userInfo.dailyTotalIncome =
          userInfo.dailyTotalIncome + new BN(amount).toNumber();
      } else if (incomeType === "level") {
        userInfo.dailyLevelIncome =
          userInfo.dailyLevelIncome + new BN(amount).toNumber();
        userInfo.dailyTotalIncome =
          userInfo.dailyTotalIncome + new BN(amount).toNumber();
      }
    } else {
      console.log("Income update skipped because transaction already exists.");
    }

    // Refresh income details for the receiver.
    const receiverIncome = await getUserIncome(userInfo.walletAddress);
    userInfo.income = {
      ...userInfo.income,
      ...receiverIncome.data,
    };
    userInfo.isActive = true;
    await userInfo.save();

    // Refresh income details for the sender.
    const fromIncome = await getUserIncome(fromUser.walletAddress);
    fromUser.income = {
      ...fromUser.income,
      ...fromIncome.data,
    };
    await fromUser.save();

    return transaction;
  } catch (error) {
    console.error("Error inserting transaction:", error);
    throw error;
  }
};

module.exports = { insertTransaction };
