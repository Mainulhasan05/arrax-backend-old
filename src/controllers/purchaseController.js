const sendResponse = require("../utils/sendResponse");
const {
  initializePurchaseSlotService,
} = require("../services/purchaseService");

// makePurchase
const initializePurchaseController = async (req, res) => {
  try {
    const { slotId } = req.body;

    if (!userId || !slotId || !amount) {
      return sendResponse(
        res,
        400,
        false,
        "User ID, slot ID, and amount are required.",
        null
      );
    }

    const result = await makePurchase({ userId, slotId, amount });
    return sendResponse(res, 201, true, "Purchase successful.", result);
  } catch (error) {
    return sendResponse(res, 500, false, error.message, null);
  }
};

module.exports = { initializePurchaseController };
