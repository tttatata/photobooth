import React from "react";
import { LayoutPreview } from "../utils/helpers";

const LayoutModal = ({ show, onClose, settings, setSettings }) => {
  if (!show) return null;
  const layouts = [
    { id: "single", label: "1 Ảnh (Ngang)", count: 1 },
    { id: "vertical-2", label: "2 Ảnh (Dọc)", count: 2 },
    { id: "vertical-3", label: "3 Ảnh (Dọc)", count: 3 },
    { id: "grid-4", label: "Lưới 4 Ảnh", count: 4 },
    { id: "grid-6", label: "Lưới 6 Ảnh", count: 6 },
    { id: "grid-8", label: "Lưới 8 Ảnh", count: 8 },
  ];
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
      <div className="custom-scrollbar" style={{ background: "#fff", padding: "25px", borderRadius: "12px", width: "90%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <h2 style={{ marginTop: 0, textAlign: "center" }}>🖼️ Chọn mẫu in (Layout)</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
          {layouts.map(item => (
            <div key={item.id} onClick={() => { setSettings({ ...settings, layout: item.id, photoCount: item.count }); onClose(); }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "15px", border: settings.layout === item.id ? "2px solid #4f46e5" : "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", width: "120px", background: settings.layout === item.id ? "#eef2ff" : "transparent", transition: "all 0.2s" }} className="hover-btn">
              <LayoutPreview layout={item.id} scale={1.5} />
              <span style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", color: "#374151" }}>{item.label}</span>
            </div>
          ))}
        </div>
        <button className="hover-btn" onClick={onClose} style={{ padding: "10px 20px", backgroundColor: "#e5e7eb", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: "15px", alignSelf: "center" }}>Đóng</button>
      </div>
    </div>
  );
};
export default LayoutModal;