const express = require("express");
const router = express.Router();
const Frame = require("../models/Frame");

// GET: /api/frames - Lấy danh sách toàn bộ frames
router.get("/", async (req, res) => {
  try {
    const frames = await Frame.find().sort({ createdAt: -1 }); // Lấy frame mới nhất xếp trước
    res.json({ success: true, frames });
  } catch (error) {
    console.error("Lỗi lấy danh sách frame:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
  }
});

// POST: /api/frames - Thêm frame mới
router.post("/", async (req, res) => {
  try {
    const { name, image, layout } = req.body;
    if (!name || !image) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tên và chọn ảnh!" });
    }
    const newFrame = await Frame.create({ name, image, layout: layout || "vertical-3" });
    res.json({ success: true, frame: newFrame, message: "Thêm frame thành công!" });
  } catch (error) {
    console.error("Lỗi thêm frame:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
  }
});

// DELETE: /api/frames/:id - Xóa frame
router.delete("/:id", async (req, res) => {
  try {
    await Frame.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xóa frame!" });
  } catch (error) {
    console.error("Lỗi xóa frame:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
  }
});

module.exports = router;