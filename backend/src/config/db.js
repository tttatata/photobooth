const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công!");
    
    // Tự động tạo tài khoản Admin nếu chưa có trong Database
    const adminExists = await User.findOne({ role: "admin" });
    const hashedPassword = await bcrypt.hash("19970091aA", 10); // Mã hóa mật khẩu
    
    if (!adminExists) {
      await User.create({
        username: "talaadmin",
        password: hashedPassword,
        role: "admin"
      });
      console.log("👤 Đã tự động tạo tài khoản Admin mặc định: talaadmin / 19970091aA");
    } else {
      // Ghi đè lại mật khẩu mã hóa cho Admin hiện tại phòng trường hợp DB cũ lưu pass chữ thường
      adminExists.password = hashedPassword;
      await adminExists.save();
      console.log("🔄 Đã cập nhật lại mật khẩu Admin bằng chuẩn mã hóa bcrypt!");
    }
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;