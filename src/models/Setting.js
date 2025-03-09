const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  // registration on/off , slotPurchase on/off
  registration: { type: Boolean, default: true },
  slotPurchase: { type: Boolean, default: true },
});
const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
