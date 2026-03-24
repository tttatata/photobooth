import React from "react";

const DesktopControls = ({ onOpenSettings, onOpenLayout, onOpenFrame, onOpenGallery }) => (
  <div className="controls-container" style={{ marginBottom: "30px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px" }}>
    <button className="hover-btn" onClick={onOpenSettings} style={{ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", color: "#4f46e5", backgroundColor: "#e0e7ff", border: "none", borderRadius: "30px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>⚙️ Cài đặt</button>
    <button className="hover-btn" onClick={onOpenLayout} style={{ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", color: "#f59e0b", backgroundColor: "#fef3c7", border: "none", borderRadius: "30px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>📐 Chọn Layout</button>
    <button className="hover-btn" onClick={onOpenFrame} style={{ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", color: "#8b5cf6", backgroundColor: "#ede9fe", border: "none", borderRadius: "30px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>🖼️ Chọn Frame</button>
    <button className="hover-btn" onClick={onOpenGallery} style={{ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", color: "#10b981", backgroundColor: "#d1fae5", border: "none", borderRadius: "30px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>📂 Gallery</button>
  </div>
);

export default DesktopControls;