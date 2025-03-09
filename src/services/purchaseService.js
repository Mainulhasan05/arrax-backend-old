const Transaction = require("../models/Transaction");
const Slot = require("../models/Slot");
const User = require("../models/User");

const initializePurchaseSlotService = async (userId, slotId) => {
  try {
    const user = await User.findOne({ userId });
    const slot = await Slot.findOne({ slotId });

    if (!user || !slot) {
      throw new Error("User or slot not found.");
    }

    const transaction = await Transaction.create({
      userId,
      amount: slot.price,
      transactionType: "SlotPurchase",
      slotNumber: slot.slotNumber,
      section: slot.section,
    });

    slot.usersCount += 1;
    await slot.save();

    return transaction;
  } catch (error) {
    throw error;
  }
};

module.exports = { initializePurchaseSlotService };
