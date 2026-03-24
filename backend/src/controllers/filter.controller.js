const Filter = require("../models/Filter");

// Lấy danh sách tất cả các filter
exports.getFilters = async (req, res) => {
  try {
    const filters = await Filter.find().sort({ createdAt: -1 });
    res.json({ success: true, filters });
  } catch (error) {
    console.error("Lỗi lấy danh sách filter:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
  }
};

// Thêm filter mới
exports.createFilter = async (req, res) => {
  try {
    const { name, filter, image } = req.body;
    
    if (!name || !filter) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tên và mã CSS filter!" });
    }

    const newFilter = await Filter.create({ name, filter, image });
    res.status(201).json({ success: true, message: "Thêm filter thành công!", filter: newFilter });
  } catch (error) {
    console.error("Lỗi thêm filter:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
  }
};

// Xóa filter
exports.deleteFilter = async (req, res) => {
  try {
    const { id } = req.params;
    await Filter.findByIdAndDelete(id);
    res.json({ success: true, message: "Xóa filter thành công!" });
  } catch (error) {
    console.error("Lỗi xóa filter:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
  }
};