const mongoose = require("mongoose");

const filterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên của filter hiển thị cho người dùng
  filter: { type: String, required: true }, // Giá trị CSS filter (vd: sepia(100%))
  image: { type: String }, // Ảnh xem trước (Base64 hoặc URL)
}, {
  timestamps: true // Tự động ghi lại ngày tạo/cập nhật
});

module.exports = mongoose.model("Filter", filterSchema);