import React from "react";

const AppHeader = ({ isMobile, navigate, onClearPhotos, onLogout }) => {
  const userName = localStorage.getItem("userName");
  const hasToken = !!localStorage.getItem("token");

  return (
    <div className="app-header">
      <h1 className="app-title">📸 VietBooth Studio</h1>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "5px" : "15px" }}>
        {userName && !isMobile && (
          <span style={{ fontWeight: "bold", color: "#374151", fontSize: "16px" }}>👋 {userName}</span>
        )}
        <button onClick={() => navigate("/")} className="hover-btn" style={{ padding: isMobile ? "8px 12px" : "10px 20px", fontSize: isMobile ? "12px" : "14px", background: isMobile ? "#374151" : "#f3f4f6", color: isMobile ? "#fff" : "#374151", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" }}>
          🏠 {isMobile ? "Home" : "Về trang chủ"}
        </button>
        <button onClick={onClearPhotos} className="hover-btn" style={{ padding: isMobile ? "8px 12px" : "10px 20px", fontSize: isMobile ? "12px" : "14px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" }}>
          🗑️ {isMobile ? "Xóa" : "Xóa ảnh"}
        </button>
        {hasToken && (
          <button onClick={onLogout} className="hover-btn" style={{ padding: isMobile ? "8px 12px" : "10px 20px", fontSize: isMobile ? "12px" : "14px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" }}>
            🚪 {isMobile ? "Thoát" : "Đăng xuất"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AppHeader;