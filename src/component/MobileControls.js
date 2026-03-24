import React from "react";

const MobileControls = ({ onOpenSettings, onOpenLayout, onOpenFrame, onOpenGallery }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
    <button onClick={onOpenSettings} style={{ padding: "12px", background: "#374151", color: "#60a5fa", border: "none", borderRadius: "12px", fontWeight: "bold", fontSize: "14px" }}>⚙️ Cài đặt</button>
    <button onClick={onOpenLayout} style={{ padding: "12px", background: "#374151", color: "#fbbf24", border: "none", borderRadius: "12px", fontWeight: "bold", fontSize: "14px" }}>📐 Layout</button>
    <button onClick={onOpenFrame} style={{ padding: "12px", background: "#374151", color: "#a78bfa", border: "none", borderRadius: "12px", fontWeight: "bold", fontSize: "14px" }}>🖼️ Frame</button>
    <button onClick={onOpenGallery} style={{ padding: "12px", background: "#374151", color: "#34d399", border: "none", borderRadius: "12px", fontWeight: "bold", fontSize: "14px" }}>📂 Gallery</button>
  </div>
);

export default MobileControls;