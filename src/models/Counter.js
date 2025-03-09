const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Identifier for the counter, e.g., "userId"
  seq: { type: Number, default: 0 }, // Sequence number
});

const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;
