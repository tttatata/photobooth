require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware: Cho phép Frontend gọi API mà không bị lỗi CORS, parse JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route cơ bản
app.get("/", (req, res) => {
  res.json({ message: "🎉 Chào mừng đến với Backend VietBooth API!" });
});

// Kết nối Database (MongoDB)
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/vietbooth")
  .then(() => {
    console.log("✅ Kết nối MongoDB thành công!");
    
    // Bắt đầu server lắng nghe port sau khi kết nối DB thành công
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
  });