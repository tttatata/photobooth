import React from "react";

const FloatingQR = ({ settings, driveFolders }) => {
  if (!settings.useDrive || !settings.driveFolderId) return null;
  const folder = driveFolders.find(f => f.id === settings.driveFolderId);
  if (!folder) return null;

  const link = folder.webViewLink || `https://drive.google.com/drive/folders/${settings.driveFolderId}?usp=sharing`;
  const qrUrl = `${process.env.REACT_APP_QR_API_URL || "https://api.qrserver.com/v1/create-qr-code/"}?size=150x150&data=${encodeURIComponent(link)}`;

  return (
    <div className="floating-qr" style={{ background: "#fff", padding: "15px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", textAlign: "center", border: "4px solid #4f46e5" }}>
      <div style={{ fontSize: "16px", fontWeight: "900", color: "#4f46e5", marginBottom: "10px", textTransform: "uppercase" }}>📸 Album Sự kiện</div>
      <img src={qrUrl} alt="Album QR" style={{ width: "150px", height: "150px", display: "block", margin: "0 auto", borderRadius: "8px" }} />
      <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "10px", fontWeight: "bold" }}>Rê chuột vào để phóng to</div>
    </div>
  );
};

export default FloatingQR;