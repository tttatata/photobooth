const express = require("express");
const cors = require("cors");
const authRoutes = require("./routers/auth.routes");
const userRoutes = require("./routers/user.routes");
const frameRoutes = require("./routers/frame.routes");

const app = express();

// Middleware: Cho phép Frontend gọi API mà không bị lỗi CORS, parse JSON
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cấu hình các đường dẫn API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/frames", frameRoutes);

// Test Route cơ bản
app.get("/", (req, res) => {
  res.json({ message: "🎉 Chào mừng đến với Backend VietBooth API!" });
});
app.get("/api", (req, res) => {
  res.json({ message: "🎉 Chào mừng đến với Backend VietBooth API!" });
});

module.exports = app;