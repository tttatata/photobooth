const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Kiểm tra tài khoản có tồn tại không
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: "Tài khoản không tồn tại!" });
    }

    // 2. Kiểm tra mật khẩu có khớp không (Dùng bcrypt để so sánh mật khẩu đã mã hóa)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Mật khẩu không chính xác!" });
    }

    // 3. Tạo JWT Token nếu đăng nhập thành công
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Token hết hạn sau 1 ngày
    );

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: { username: user.username, role: user.role }
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Không nhận được email từ Google!" });
    }

    // 1. Tìm user bằng email (lưu trong trường username)
    let user = await User.findOne({ username: email });

    if (!user) {
      // Nếu chưa có, tự động tạo tài khoản mới với quyền 'user'
      user = await User.create({
        username: email,
        role: "user",
        isActive: true
      });
    }

    // 2. Kiểm tra xem tài khoản có bị admin khóa không
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa bởi Admin!" });
    }

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Đăng nhập Google thành công!",
      token,
      user: { username: user.username, role: user.role }
    });
  } catch (error) {
    console.error("Lỗi đăng nhập Google:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
  }
};