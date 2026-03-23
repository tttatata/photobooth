import React, { useState } from "react";

// Component hỗ trợ vẽ sơ đồ thiết kế
const LayoutGuide = ({ title, width, height, children, details }) => (
  <div style={{ marginBottom: "15px", padding: "10px", background: "#fff", borderRadius: "8px", border: "1px solid #d1d5db", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
    <div style={{ fontWeight: "bold", color: "#4f46e5", marginBottom: "8px", fontSize: "14px" }}>{title} ({width} x {height} px)</div>
    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
      <svg viewBox={`0 0 ${width/10} ${height/10}`} style={{ width: width > height ? "100px" : "66px", height: width > height ? "66px" : "100px", background: "#e5e7eb", borderRadius: "4px", flexShrink: 0, border: "1px solid #9ca3af" }}>
        {children}
      </svg>
      <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#4b5563" }}>
        {details.map((d, i) => <div key={i}>{d}</div>)}
      </div>
    </div>
  </div>
);

const FrameModal = ({ show, onClose, settings, setSettings, sampleFrames }) => {
  const [showFrameInfo, setShowFrameInfo] = useState(false);
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
      <div style={{ position: "relative", background: "#fff", padding: "25px", borderRadius: "12px", width: "95%", maxWidth: "900px", maxHeight: "95vh", display: "flex", flexDirection: "column", gap: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <button className="hover-btn" onClick={onClose} style={{ position: "absolute", top: "15px", right: "15px", background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>❌</button>
        <h2 style={{ marginTop: 0 }}>🖼️ Chọn Frame</h2>
        
        <label style={{ fontWeight: "bold", fontSize: "16px" }}>✨ Kho Frame của hệ thống:</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "15px", overflowY: "auto", padding: "10px", maxHeight: "55vh", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          <div onClick={() => setSettings({...settings, frame: null})} className="hover-btn" style={{ position: "relative", border: !settings.frame ? "3px solid #8b5cf6" : "1px solid #d1d5db", borderRadius: "10px", cursor: "pointer", padding: "10px", background: "#fff", display: "flex", flexDirection: "column", opacity: settings.frame ? 0.6 : 1, transition: "all 0.3s ease", boxShadow: !settings.frame ? "0 4px 10px rgba(139, 92, 246, 0.3)" : "none" }}>
            {!settings.frame && <div style={{ position: "absolute", top: "8px", right: "8px", background: "#10b981", color: "white", borderRadius: "50%", width: "26px", height: "26px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold", zIndex: 10 }}>✓</div>}
            <div style={{ height: "180px", display: "flex", justifyContent: "center", alignItems: "center", background: "#f3f4f6", borderRadius: "6px", fontSize: "40px", border: "2px dashed #9ca3af" }}>🚫</div>
            <div style={{ fontSize: "14px", textAlign: "center", marginTop: "10px", fontWeight: "bold", color: "#374151" }}>Không dùng</div>
          </div>
          {sampleFrames.map(f => (
            <div key={f.id} onClick={() => setSettings({...settings, frame: settings.frame === f.src ? null : f.src})} className="hover-btn" style={{ position: "relative", border: settings.frame === f.src ? "3px solid #8b5cf6" : "1px solid #d1d5db", borderRadius: "10px", cursor: "pointer", padding: "10px", background: "#fff", display: "flex", flexDirection: "column", opacity: settings.frame && settings.frame !== f.src ? 0.6 : 1, filter: settings.frame && settings.frame !== f.src ? "grayscale(50%)" : "none", transition: "all 0.3s ease", boxShadow: settings.frame === f.src ? "0 4px 10px rgba(139, 92, 246, 0.3)" : "none" }}>
              {settings.frame === f.src && <div style={{ position: "absolute", top: "8px", right: "8px", background: "#10b981", color: "white", borderRadius: "50%", width: "26px", height: "26px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "14px", fontWeight: "bold", zIndex: 10 }}>✓</div>}
              <img src={f.src} alt={f.label} style={{ width: "100%", height: "180px", objectFit: "contain", borderRadius: "6px", background: "#e5e7eb" }} />
              <div style={{ fontSize: "14px", textAlign: "center", marginTop: "10px", fontWeight: "bold", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={f.label}>{f.label}</div>
            </div>
          ))}
          {sampleFrames.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "30px", color: "#6b7280" }}>Chưa có frame nào. Hãy thêm từ Admin Panel!</div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
          <label style={{ fontWeight: "bold", margin: 0 }}>Tải lên thiết kế của bạn (PNG):</label>
          <button className="hover-btn" onClick={() => setShowFrameInfo(!showFrameInfo)} style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }} title="Xem kích thước chuẩn">?</button>
        </div>

        {showFrameInfo && (
          <div style={{ background: "#f3f4f6", padding: "15px", borderRadius: "8px", overflowY: "auto", flex: 1 }}>
            <h3 style={{ marginTop: 0, fontSize: "16px", color: "#111827", borderBottom: "2px solid #8b5cf6", paddingBottom: "5px", display: "inline-block" }}>📐 Thông số Thiết kế Frame Chuẩn</h3>
            <p style={{ fontSize: "13px", color: "#4b5563", marginBottom: "15px" }}>Thiết kế file PNG có nền trong suốt ở các "Ô ảnh" để lộ hình chụp bên dưới.</p>
            
            <LayoutGuide title="1 Ảnh (Khổ ngang)" width={1800} height={1200} details={["Kích thước Ô ảnh: 1500 x 1000 px", "Tọa độ góc trái trên (X, Y): 150, 100"]}>
              <rect x="15" y="10" width="150" height="100" fill="#9ca3af" />
            </LayoutGuide>

            <LayoutGuide title="2 Ảnh (Khổ dọc)" width={1200} height={1800} details={["Kích thước Ô ảnh: 1050 x 700 px", "Tọa độ X chung: 75", "Tọa độ Y lần lượt: 133, 966"]}>
              <rect x="7.5" y="13.3" width="105" height="70" fill="#9ca3af" />
              <rect x="7.5" y="96.6" width="105" height="70" fill="#9ca3af" />
            </LayoutGuide>

            <LayoutGuide title="3 Ảnh (Khổ dọc)" width={1200} height={1800} details={["Kích thước Ô ảnh: 840 x 560 px", "Tọa độ X chung: 180", "Tọa độ Y lần lượt: 30, 620, 1210"]}>
              <rect x="18" y="3" width="84" height="56" fill="#9ca3af" />
              <rect x="18" y="62" width="84" height="56" fill="#9ca3af" />
              <rect x="18" y="121" width="84" height="56" fill="#9ca3af" />
            </LayoutGuide>

            <LayoutGuide title="Lưới 4 Ảnh (Khổ ngang)" width={1800} height={1200} details={["Kích thước Ô ảnh: 800 x 533 px", "Tọa độ X (Cột 1, Cột 2): 66, 934", "Tọa độ Y (Hàng 1, Hàng 2): 44, 623"]}>
              <rect x="6.6" y="4.4" width="80" height="53.3" fill="#9ca3af" />
              <rect x="93.4" y="4.4" width="80" height="53.3" fill="#9ca3af" />
              <rect x="6.6" y="62.3" width="80" height="53.3" fill="#9ca3af" />
              <rect x="93.4" y="62.3" width="80" height="53.3" fill="#9ca3af" />
            </LayoutGuide>

            <LayoutGuide title="Lưới 6 Ảnh (Khổ dọc)" width={1200} height={1800} details={["Kích thước Ô ảnh: 500 x 333 px", "Tọa độ X (Cột 1, Cột 2): 66, 634", "Tọa độ Y (Hàng 1, 2, 3): 200, 650, 1100"]}>
              <rect x="6.6" y="20" width="50" height="33.3" fill="#9ca3af" />
              <rect x="63.4" y="20" width="50" height="33.3" fill="#9ca3af" />
              <rect x="6.6" y="65" width="50" height="33.3" fill="#9ca3af" />
              <rect x="63.4" y="65" width="50" height="33.3" fill="#9ca3af" />
              <rect x="6.6" y="110" width="50" height="33.3" fill="#9ca3af" />
              <rect x="63.4" y="110" width="50" height="33.3" fill="#9ca3af" />
            </LayoutGuide>

            <LayoutGuide title="Lưới 8 Ảnh (Khổ dọc)" width={1200} height={1800} details={["Kích thước Ô ảnh: 510 x 340 px", "Tọa độ X (Cột 1, Cột 2): 60, 630", "Tọa độ Y (Hàng 1, 2, 3, 4): 88, 516, 944, 1372"]}>
              <rect x="6" y="8.8" width="51" height="34" fill="#9ca3af" />
              <rect x="63" y="8.8" width="51" height="34" fill="#9ca3af" />
              <rect x="6" y="51.6" width="51" height="34" fill="#9ca3af" />
              <rect x="63" y="51.6" width="51" height="34" fill="#9ca3af" />
              <rect x="6" y="94.4" width="51" height="34" fill="#9ca3af" />
              <rect x="63" y="94.4" width="51" height="34" fill="#9ca3af" />
              <rect x="6" y="137.2" width="51" height="34" fill="#9ca3af" />
              <rect x="63" y="137.2" width="51" height="34" fill="#9ca3af" />
            </LayoutGuide>
          </div>
        )}

        <input type="file" accept="image/png" onChange={(e) => { if (e.target.files[0]) { setSettings({ ...settings, frame: URL.createObjectURL(e.target.files[0]) }); } }} style={{ padding: "10px", border: "1px dashed #ccc", borderRadius: "8px" }} />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "auto", paddingTop: "10px" }}>
          <button className="hover-btn" onClick={onClose} style={{ padding: "10px 20px", background: "#e5e7eb", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Đóng</button>
          <button className="hover-btn" onClick={onClose} style={{ padding: "10px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" }}>💾 Lưu Frame</button>
        </div>
      </div>
    </div>
  );
};
export default FrameModal;