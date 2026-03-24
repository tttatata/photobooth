const express = require("express");
const router = express.Router();
const Filter = require("../models/Filter");

// 1. Lấy danh sách toàn bộ Filter
router.get("/", async (req, res) => {
  try {
    const filters = await Filter.find().sort({ createdAt: -1 });
    res.json({ success: true, filters });
  } catch (error) {
    console.error("Lỗi lấy danh sách filter:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 2. Thêm mới một Filter
router.post("/", async (req, res) => {
  try {
    const { name, filter, icon } = req.body;
    const newFilter = await Filter.create({ name, filter, icon });
    res.json({ success: true, filter: newFilter });
  } catch (error) {
    console.error("Lỗi tạo filter:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// 3. Xóa một Filter theo ID
router.delete("/:id", async (req, res) => {
  try {
    await Filter.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xóa Filter thành công" });
  } catch (error) {
    console.error("Lỗi xóa filter:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

module.exports = router;