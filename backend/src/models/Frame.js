const mongoose = require("mongoose");

const frameSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên của frame
  image: { type: String, required: true }, // Dữ liệu ảnh dạng chuỗi Base64
  layout: { type: String, required: true }, // Tên Layout (vd: vertical-3, single, grid-4)
}, {
  timestamps: true // Tự động ghi lại ngày tạo
});

module.exports = mongoose.model("Frame", frameSchema);