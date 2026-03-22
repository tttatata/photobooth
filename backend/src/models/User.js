const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Tên đăng nhập hoặc Email Google
  password: { type: String }, // Mật khẩu (không bắt buộc với đăng nhập qua Google)
  role: { type: String, default: "user" }, // Quyền mặc định là user
  isActive: { type: Boolean, default: true } // Trạng thái hoạt động
}, {
  timestamps: true // Tự động thêm thời gian tạo (createdAt) và cập nhật (updatedAt)
});

module.exports = mongoose.model("User", userSchema);