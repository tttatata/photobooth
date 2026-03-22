app.get("/", (req, res) => {
  res.json({ message: "🎉 Chào mừng đến với Backend VietBooth API!" });
});
require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Khởi động server
const startServer = async () => {
  // Kết nối Database
  await connectDB();

  // Lắng nghe port
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
};app.get("/", (req, res) => {
  res.json({ message: "🎉 Chào mừng đến với Backend VietBooth API!" });
});


startServer();