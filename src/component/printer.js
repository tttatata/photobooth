import React, { useState } from "react";

const PrintModal = ({ photoUrl, onClose }) => {
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [frames, setFrames] = useState([
    { id: "classic", src: "/frames/classic.png" },
    { id: "modern", src: "/frames/modern.png" },
    { id: "funny", src: "/frames/funny.png" },
  ]);

  // Hàm thêm frame mới
  const handleAddFrame = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newFrame = {
        id: `custom-${Date.now()}`,
        src: URL.createObjectURL(file),
      };
      setFrames([...frames, newFrame]); // thêm vào danh sách frame
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
    }}>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", width: "80%", maxWidth: "600px" }}>
        <h3>Chọn frame cho ảnh</h3>

        {/* Danh sách frame */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {frames.map((frame) => (
            <img
              key={frame.id}
              src={frame.src}
              alt={frame.id}
              style={{
                width: 80, height: 60,
                border: selectedFrame?.id === frame.id ? "3px solid red" : "1px solid #ccc",
                cursor: "pointer",
              }}
              onClick={() => setSelectedFrame(frame)}
            />
          ))}
        </div>

        {/* Nút thêm frame mới */}
        <div style={{ marginBottom: "20px" }}>
          <label>➕ Thêm frame mới:</label>
          <input type="file" accept="image/png, image/jpeg" onChange={handleAddFrame} />
        </div>

        {/* Preview ảnh với frame */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <img src={photoUrl} alt="preview" style={{ width: "100%", border: "1px solid #ccc" }} />
          {selectedFrame && (
            <img
              src={selectedFrame.src}
              alt="frame overlay"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            />
          )}
        </div>

        <div style={{ marginTop: "20px" }}>
          <button onClick={() => window.print()}>🖨️ In ngay</button>
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
