import React, { useState } from "react";

const GalleryModal = ({ show, onClose, photos, rawPhotos, selectedPhotos, toggleSelect, printPhoto, onPrintAny }) => {
  const [activeTab, setActiveTab] = useState("collages"); // "collages" | "raw"
  const [previewPhoto, setPreviewPhoto] = useState(null); // State lưu ảnh đang được xem trước

  if (!show) return null;

  const displayPhotos = activeTab === "collages" ? photos : rawPhotos;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100, backdropFilter: "blur(5px)" }}>
      <div style={{ position: "relative", background: "#f9fafb", borderRadius: "20px", width: "95%", maxWidth: "1000px", height: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
        
        {/* Header */}
        <div style={{ background: "#fff", padding: "20px 30px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: "24px", color: "#111827", display: "flex", alignItems: "center", gap: "10px" }}>
            📂 Thư viện ảnh
          </h2>
          <button className="hover-btn" onClick={onClose} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "50%", width: "40px", height: "40px", fontSize: "18px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}>❌</button>
        </div>

        {/* Toolbar (Tabs + Actions) */}
        <div style={{ padding: "20px 30px", background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "15px", alignItems: "center" }}>
          
          <div style={{ display: "flex", background: "#f3f4f6", padding: "5px", borderRadius: "12px" }}>
            <button 
              onClick={() => setActiveTab("collages")} 
              style={{ padding: "10px 20px", background: activeTab === "collages" ? "#fff" : "transparent", color: activeTab === "collages" ? "#4f46e5" : "#6b7280", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", boxShadow: activeTab === "collages" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
            >
              🖼️ Ảnh đã ghép ({photos.length})
            </button>
            <button 
              onClick={() => setActiveTab("raw")} 
              style={{ padding: "10px 20px", background: activeTab === "raw" ? "#fff" : "transparent", color: activeTab === "raw" ? "#4f46e5" : "#6b7280", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", boxShadow: activeTab === "raw" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
            >
              📷 Ảnh gốc ({rawPhotos.length})
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <label className="hover-btn" style={{ padding: "10px 20px", background: "#111827", color: "white", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
              🖨️ In ảnh từ máy tính
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const url = URL.createObjectURL(e.target.files[0]);
                  printPhoto(url); // Mở Modal in với ảnh vừa tải lên từ máy tính
                }
              }} />
            </label>
          </div>
        </div>

        {/* Image Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "30px", background: "#f9fafb" }}>
          {displayPhotos.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>📭</div>
              <h3 style={{ margin: 0, color: "#6b7280" }}>Chưa có ảnh nào</h3>
              <p style={{ marginTop: "5px" }}>Hãy bắt đầu chụp vài tấm nhé!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "25px" }}>
              {displayPhotos.map((photo, index) => {
                const isSelected = selectedPhotos.includes(photo);
                return (
                  <div key={`gallery-${activeTab}-${index}`} className="gallery-item hover-btn" style={{ background: "#fff", padding: "10px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", display: "flex", flexDirection: "column" }}>
                    <div onClick={() => toggleSelect(photo)} style={{ position: "relative", width: "100%", paddingBottom: "100%", borderRadius: "10px", overflow: "hidden", cursor: "pointer", border: isSelected ? "3px solid #4f46e5" : "3px solid transparent", boxSizing: "border-box" }}>
                      <img src={photo} alt={`Gallery ${index}`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", background: "#f3f4f6" }} />
                      {isSelected && (
                        <div style={{ position: "absolute", top: "10px", right: "10px", background: "#4f46e5", color: "white", borderRadius: "50%", width: "28px", height: "28px", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>✓</div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                      <button className="hover-btn" onClick={() => printPhoto(photo)} style={{ flex: 1, padding: "10px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "5px" }}>🖨️ In ảnh</button>
                      <button className="hover-btn" onClick={() => setPreviewPhoto(photo)} style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "40px", background: "#3b82f6", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "18px", transition: "all 0.2s" }} title="Xem trước phóng to">👁️</button>
                      <a href={photo} download={`VietBooth_${activeTab}_${Date.now()}.png`} style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "40px", background: "#e5e7eb", color: "#374151", borderRadius: "8px", textDecoration: "none", fontSize: "18px", transition: "all 0.2s" }} className="hover-btn" title="Tải về máy">⬇️</a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- Màn hình Modal xem trước ảnh Fullscreen --- */}
        {previewPhoto && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
            <div style={{ position: "relative", width: "90%", height: "90%", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <button className="hover-btn" onClick={() => setPreviewPhoto(null)} style={{ position: "absolute", top: "10px", right: "20px", background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1210 }}>❌</button>
              <img src={previewPhoto} alt="Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default GalleryModal;