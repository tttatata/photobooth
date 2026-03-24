const mongoose = require("mongoose");

const filterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  filter: { type: String, required: true },
  icon: { type: String, default: "✨" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Filter", filterSchema);