import React, { useState } from "react";

const FrameModal = ({ show, onClose, settings, setSettings, sampleFrames }) => {
  const [showFrameInfo, setShowFrameInfo] = useState(false);
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
      <div style={{ position: "relative", background: "#fff", padding: "25px", borderRadius: "12px", width: "90%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <button className="hover-btn" onClick={onClose} style={{ position: "absolute", top: "15px", right: "15px", background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>❌</button>
        <h2 style={{ marginTop: 0 }}>🖼️ Chọn Frame</h2>
        
        <label style={{ fontWeight: "bold" }}>✨ Mẫu tự động tạo (Khớp với Layout hiện tại):</label>
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px" }}>
          <div onClick={() => setSettings({...settings, frame: null})} style={{ position: "relative", border: !settings.frame ? "3px solid #8b5cf6" : "1px solid #ccc", borderRadius: "8px", cursor: "pointer", padding: "5px", flexShrink: 0, opacity: settings.frame ? 0.5 : 1, filter: settings.frame ? "blur(2px) grayscale(50%)" : "none", transition: "all 0.3s ease" }}>
            {!settings.frame && <div style={{ position: "absolute", top: "8px", right: "8px", background: "#10b981", color: "white", borderRadius: "50%", width: "24px", height: "24px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold", zIndex: 10 }}>✓</div>}
            <div style={{ width: "80px", height: "120px", display: "flex", justifyContent: "center", alignItems: "center", background: "#f3f4f6", borderRadius: "4px", fontSize: "30px", border: "1px dashed #9ca3af" }}>🚫</div>
            <div style={{ fontSize: "12px", textAlign: "center", marginTop: "5px", fontWeight: "bold", color: "#374151" }}>Không dùng</div>
          </div>
          {sampleFrames.map(f => (
            <div key={f.id} onClick={() => setSettings({...settings, frame: settings.frame === f.src ? null : f.src})} style={{ position: "relative", border: settings.frame === f.src ? "3px solid #8b5cf6" : "1px solid #ccc", borderRadius: "8px", cursor: "pointer", padding: "5px", flexShrink: 0, opacity: settings.frame && settings.frame !== f.src ? 0.5 : 1, filter: settings.frame && settings.frame !== f.src ? "blur(2px) grayscale(50%)" : "none", transition: "all 0.3s ease" }}>
              {settings.frame === f.src && <div style={{ position: "absolute", top: "8px", right: "8px", background: "#10b981", color: "white", borderRadius: "50%", width: "24px", height: "24px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold", zIndex: 10 }}>✓</div>}
              <img src={f.src} alt={f.label} style={{ width: "80px", height: "120px", objectFit: "contain", borderRadius: "4px", background: "#e5e7eb" }} />
              <div style={{ fontSize: "12px", textAlign: "center", marginTop: "5px", fontWeight: "bold" }}>{f.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
          <label style={{ fontWeight: "bold", margin: 0 }}>Tải lên thiết kế của bạn (PNG):</label>
          <button className="hover-btn" onClick={() => setShowFrameInfo(!showFrameInfo)} style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }} title="Xem kích thước chuẩn">?</button>
        </div>

        {showFrameInfo && (
          <div style={{ background: "#f3f4f6", padding: "12px", borderRadius: "8px", fontSize: "14px", color: "#374151", borderLeft: "4px solid #8b5cf6" }}>
            <strong>📏 Kích thước thiết kế Frame chuẩn:</strong><br/>
            • Mẫu 1 Ảnh, 4 Ảnh (Khổ ngang): <strong>1800 x 1200 px</strong><br/>
            • Mẫu 2, 3, 6, 8 Ảnh (Khổ dọc): <strong>1200 x 1800 px</strong><br/>
          </div>
        )}
        <input type="file" accept="image/png" onChange={(e) => { if (e.target.files[0]) { setSettings({ ...settings, frame: URL.createObjectURL(e.target.files[0]) }); } }} style={{ padding: "10px", border: "1px dashed #ccc", borderRadius: "8px" }} />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
          <button className="hover-btn" onClick={onClose} style={{ padding: "10px 20px", background: "#e5e7eb", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Đóng</button>
          <button className="hover-btn" onClick={onClose} style={{ padding: "10px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" }}>💾 Lưu Frame</button>
        </div>
      </div>
    </div>
  );
};
export default FrameModal;