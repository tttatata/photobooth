import React from "react";

const GalleryModal = ({ show, onClose, photos, rawPhotos, selectedPhotos, toggleSelect, printPhoto, onPrintAny }) => {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
      <div style={{ position: "relative", background: "#fff", padding: "25px", borderRadius: "12px", width: "90%", maxWidth: "800px", maxHeight: "85vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <button className="hover-btn" onClick={onClose} style={{ position: "absolute", top: "15px", right: "15px", background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>❌</button>
        <h2 style={{ marginTop: 0, textAlign: "center" }}>📂 Gallery (Ảnh đã lưu)</h2>
        
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <button className="hover-btn" onClick={onPrintAny} style={{ padding: "10px 20px", background: "#374151", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>🖨️ In một bức ảnh bất kỳ</button>
        </div>

        <h3 style={{ textAlign: "center", color: "#4f46e5", margin: "10px 0" }}>🌟 Tất cả hình ảnh</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center", paddingBottom: "20px" }}>
          {[...photos, ...rawPhotos].map((photo, index) => {
            const isSelected = selectedPhotos.includes(photo);
            return (
              <div key={`gallery-${index}`} style={{ textAlign: "center" }}>
                <img src={photo} alt={`Gallery ${index}`} style={{ width: "150px", height: "150px", objectFit: "contain", border: isSelected ? "4px solid #ef4444" : "1px solid #ccc", borderRadius: "8px", cursor: "pointer", background: "#f9fafb", boxSizing: "border-box" }} onClick={() => toggleSelect(photo)} />
                <div style={{ marginTop: "8px" }}>
                  <button className="hover-btn" onClick={() => printPhoto(photo)} style={{ padding: "6px 15px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>🖨️ In</button>
                </div>
              </div>
            );
          })}
          {photos.length === 0 && rawPhotos.length === 0 && <p style={{ color: "#9ca3af", fontStyle: "italic" }}>Chưa có ảnh nào trong Gallery.</p>}
        </div>
      </div>
    </div>
  );
};
export default GalleryModal;