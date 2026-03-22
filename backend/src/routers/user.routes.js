const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET: /api/users - Lấy danh sách toàn bộ người dùng
router.get("/", async (req, res) => {
  try {
    // Lấy tất cả user nhưng bỏ đi trường password để bảo mật
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    console.error("Lỗi lấy danh sách user:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
  }
});

module.exports = router;