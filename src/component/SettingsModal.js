import React from "react";

const SettingsModal = ({ show, onClose, devices, selectedDevice, setSelectedDevice, startCamera, previewVideoRef, stream, settings, setSettings, selectDirectory, directoryHandle, accessToken, driveFolders, createDriveFolder, showFolderQr, onOpenDrivePicker }) => {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ position: "relative", background: "#fff", padding: "30px", borderRadius: "12px", width: "90%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <button className="hover-btn" onClick={onClose} style={{ position: "absolute", top: "15px", right: "15px", background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>❌</button>
        <h2 style={{ marginTop: 0 }}>⚙️ Cài đặt</h2>
        
        <label style={{ fontWeight: "bold" }}>📹 Chọn camera:</label>
        <select value={selectedDevice} onChange={(e) => { setSelectedDevice(e.target.value); startCamera(e.target.value); }} style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}>
          <option value="">Chọn camera</option>
          {devices.map((device) => ( <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option> ))}
        </select>

        <div style={{ width: "100%", height: "180px", backgroundColor: "#111827", borderRadius: "8px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
          {!stream && ( <div style={{ position: "absolute", color: "#9ca3af", textAlign: "center", zIndex: 1 }}><div style={{ fontSize: "24px", marginBottom: "5px" }}>📷</div>Vui lòng chọn camera</div> )}
          <video ref={previewVideoRef} autoPlay muted playsInline style={{ height: "100%", maxWidth: "100%", objectFit: "contain", zIndex: 2, opacity: stream ? 1 : 0 }} />
        </div>
        <div style={{ textAlign: "center", color: "#6b7280", fontSize: "12px", marginTop: "-5px", fontStyle: "italic" }}>Camera preview</div>
        
        <label style={{ fontWeight: "bold" }}>⏱️ Hẹn giờ bắt đầu: {settings.countdown} giây</label>
        <input type="range" min="0" max="20" value={settings.countdown} onChange={(e) => setSettings({ ...settings, countdown: parseInt(e.target.value) })} style={{ cursor: "pointer" }} />

        <label style={{ fontWeight: "bold" }}>⏳ Thời gian giữa các lần chụp: {settings.interval === 0 ? "0 giây (Chủ động)" : `${settings.interval} giây`}</label>
        <input type="range" min="0" max="30" value={settings.interval} onChange={(e) => setSettings({ ...settings, interval: parseInt(e.target.value) })} style={{ cursor: "pointer" }} />

        <label style={{ fontWeight: "bold" }}>💾 Nơi lưu trữ ảnh (Trên máy tính):</label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="hover-btn" onClick={selectDirectory} style={{ padding: "8px 15px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>📁 Chọn thư mục</button>
          <span style={{ fontSize: "14px", color: directoryHandle ? "#10b981" : "#ef4444", fontWeight: "bold" }}>{directoryHandle ? `Đã chọn: ${directoryHandle.name}` : "Chưa chọn (Ảnh chỉ lưu web)"}</span>
        </div>

        <label style={{ fontWeight: "bold", marginTop: "10px" }}>☁️ Lưu ảnh lên Google Drive (QR Code):</label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input type="checkbox" checked={settings.useDrive} onChange={(e) => { if (!accessToken && e.target.checked) return alert("Vui lòng đăng nhập Google ở ngoài màn hình chính để sử dụng chức năng này!"); setSettings({...settings, useDrive: e.target.checked}); }} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
          <span style={{ fontSize: "14px", color: settings.useDrive ? "#10b981" : "#6b7280" }}>{settings.useDrive ? "Đã bật (Khách có thể quét QR)" : "Đang tắt"}</span>
        </div>

        {settings.useDrive && (
          <div style={{ background: "#f3f4f6", padding: "15px", borderRadius: "8px", marginTop: "5px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #d1d5db" }}>
              <input type="checkbox" checked={!!settings.uploadRawPhotos} onChange={(e) => setSettings({...settings, uploadRawPhotos: e.target.checked})} style={{ width: "18px", height: "18px", cursor: "pointer" }} id="uploadRawToggle" />
              <label htmlFor="uploadRawToggle" style={{ fontSize: "14px", color: "#374151", cursor: "pointer", fontWeight: "bold" }}>⬆️ Upload kèm các ảnh lẻ (chưa ghép Frame)</label>
            </div>
            <label style={{ fontWeight: "bold", fontSize: "14px", display: "block", marginBottom: "8px" }}>📁 Chọn thư mục Drive lưu ảnh sự kiện:</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="hover-btn" onClick={onOpenDrivePicker} style={{ flex: 1, padding: "10px", backgroundColor: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>📂</span>
                {settings.driveFolderId && driveFolders.find(f => f.id === settings.driveFolderId) ? driveFolders.find(f => f.id === settings.driveFolderId).name : "Nhấn để chọn thư mục Drive..."}
              </button>
              {settings.driveFolderId && (
                <button className="hover-btn" onClick={() => showFolderQr(settings.driveFolderId)} style={{ padding: "8px 15px", backgroundColor: "#8b5cf6", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", whiteSpace: "nowrap" }}>
                  📱 Xem QR
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
          <button className="hover-btn" onClick={onClose} style={{ padding: "10px 20px", backgroundColor: "#e5e7eb", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Đóng</button>
          <button className="hover-btn" onClick={onClose} style={{ padding: "10px 20px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" }}>💾 Lưu cài đặt</button>
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;