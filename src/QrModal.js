import React from "react";
const QrModal = ({ show, onClose, qrLink }) => {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "20px", textAlign: "center", maxWidth: "400px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", animation: "rainbowBorder 3s infinite linear", border: "4px solid transparent" }}>
        <h2 style={{ fontSize: "28px", margin: "0 0 10px 0", color: "#111827" }}>🎉 Ảnh của bạn đã xong!</h2>
        <p style={{ color: "#4b5563", marginBottom: "30px" }}>Quét mã QR dưới đây để tải ảnh gốc chất lượng cao về điện thoại của bạn.</p>
        <div style={{ background: "#f3f4f6", padding: "20px", borderRadius: "16px", display: "inline-block", marginBottom: "30px" }}>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrLink)}`} alt="QR Code" style={{ display: "block" }} />
        </div>
        <button onClick={onClose} style={{ padding: "15px 40px", fontSize: "18px", fontWeight: "bold", background: "#ef4444", color: "white", border: "none", borderRadius: "30px", cursor: "pointer", width: "100%" }}>
          Đóng
        </button>
      </div>
    </div>
  );
};
export default QrModal;