const mongoose = require("mongoose");

const frameSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên của frame
  image: { type: String, required: true }, // Dữ liệu ảnh dạng chuỗi Base64
  layout: { type: String, required: true, default: "vertical-3" }, // Layout áp dụng
}, {
  timestamps: true // Tự động ghi lại ngày tạo
});

module.exports = mongoose.model("Frame", frameSchema);