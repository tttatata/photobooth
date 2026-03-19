
import React, { useState, useRef, useEffect } from "react";
import PrintModal  from "../src/component/printer.js"
function App() {
  const [showPrintModal, setShowPrintModal] = useState(false);
const [photoToPrint, setPhotoToPrint] = useState(null);

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [settings, setSettings] = useState({
    countdown: 3,
    photoCount: 1,
    interval: 2,
    filter: "none",
    frame: null,
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "80px",
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: "20px",
    borderRadius: "10px",
  };

  // Liệt kê camera
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      setDevices(videoDevices);
    });
  }, []);
  const [countdownValue, setCountdownValue] = useState(null);
  const [intervalValue, setIntervalValue] = useState(null);

  async function clgcapturePhoto() {
    // logic chụp và lưu ảnh
    console.log("Ảnh đã chụp và lưu!");
  }

  const captureWithSettings = async () => {
    // Đếm ngược trước khi chụp ảnh đầu tiên
    let timeLeft = settings.countdown;
    setCountdownValue(timeLeft);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        timeLeft -= 1;
        setCountdownValue(timeLeft);

        if (timeLeft < 0) {
          clearInterval(interval);
          setCountdownValue(null);
          resolve();
        }
      }, 1000);
    });
    //thông báo ảnh đã
 await clgcapturePhoto();
    // Chụp ảnh đầu tiên và chờ lưu xong
    await capturePhoto();

    // Chụp các ảnh tiếp theo
    for (let i = 1; i < settings.photoCount; i++) {
      let timeLeft = settings.interval;
      setIntervalValue(timeLeft);

      await new Promise((resolve) => {
        const interval = setInterval(() => {
          timeLeft -= 1;
          setIntervalValue(timeLeft);

          if (timeLeft <= 0) {
            clearInterval(interval);
            setIntervalValue(null);
            resolve();
          }
        }, 1000);
      });

      await capturePhoto();
    }
  };
///////////////////////////////////////////////
  // Bắt đầu camera
  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { deviceId: selectedDevice } })
      .then((s) => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => console.error("Lỗi truy cập camera:", err));
  };

  const PHOTO_WIDTH = 600;
  const PHOTO_HEIGHT = 400;
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = PHOTO_WIDTH;
    canvas.height = PHOTO_HEIGHT;

    
      const dataUrl = canvas.toDataURL("image/png");
      setPhotos((prev) => [...prev, dataUrl]);
    
  };


  // Chọn ảnh
  const toggleSelect = (index) => {
    if (selectedPhotos.includes(index)) {
      setSelectedPhotos((prev) => prev.filter((i) => i !== index));
    } else {
      setSelectedPhotos((prev) => [...prev, index]);
    }
  };

  // // In ảnh
  // const printPhoto = (photo) => {
  //   const printWindow = window.open("", "_blank");
  //   printWindow.document.write(`
  //     <html>
  //       <body style="text-align:center;">
  //         <img src="${photo}" style="max-width:100%;"/>
  //         <script>window.print();</script>
  //       </body>
  //     </html>
  //   `);
  // };



  const printPhoto = (photo) => {
    setPhotoToPrint(photo);       // ảnh được chọn từ gallery
    setShowPrintModal(true);      // mở modal
  };
  return (
    <div className="booth-container">
      <h1>Photobooth 🎉</h1>

      {/* Setting */}
      <div className="settings">
        <h2>⚙️ Cài đặt</h2>
        <label>Chọn camera:</label>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          <option value="">Chọn camera</option>
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>

        <button onClick={startCamera}>Bắt đầu</button>
        <label>⏱️ Hẹn giờ (giây):</label>
        <input
          type="number"
          value={settings.countdown}
          onChange={(e) =>
            setSettings({ ...settings, countdown: parseInt(e.target.value) })
          }
        />

        <label>📷 Số ảnh chụp:</label>
        <select
          value={settings.photoCount}
          onChange={(e) =>
            setSettings({ ...settings, photoCount: parseInt(e.target.value) })
          }
        >
          <option value={1}>1</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
        <label>⏱️ Thời gian giữa các lần chụp (giây):</label>
        <input
          type="number"
          value={settings.interval}
          onChange={(e) =>
            setSettings({ ...settings, interval: parseInt(e.target.value) })
          }
        />

        <label>🎨 Filter:</label>
        <select
          value={settings.filter}
          onChange={(e) => setSettings({ ...settings, filter: e.target.value })}
        >
          <option value="none">None</option>
          <option value="grayscale(100%)">Grayscale</option>
          <option value="sepia(100%)">Sepia</option>
          <option value="brightness(1.5)">Bright</option>
        </select>

        <label>🖼️ Frame:</label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={(e) => {
            if (e.target.files[0]) {
              setSettings({
                ...settings,
                frame: URL.createObjectURL(e.target.files[0]),
              });
            }
          }}
        />
      </div>

      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          autoPlay
          style={{
            width: `${PHOTO_WIDTH}px`,
            height: `${PHOTO_HEIGHT}px`,
            border: "1px solid #ccc",
            filter: settings.filter,
          }}
        />
         {countdownValue !== null && (
        <div style={{ fontSize: "24px", color: "red" }}>
          Đếm ngược: {countdownValue}s
        </div>
      )}

        {/* Hiển thị interval giữa các ảnh */}
      {intervalValue !== null && (
        <div style={{ fontSize: "20px", color: "blue" }}>
          Ảnh tiếp theo sau: {intervalValue}s
        </div>
      )}
      </div>

      {/* Nút chụp */}
      <div className="booth-footer">
        <button onClick={captureWithSettings} className="rect-btn start">
          📸 START
        </button>
      </div>
<button onClick={printPhoto}>in ảnh</button>
{showPrintModal && (
  <PrintModal
    photoUrl={photoToPrint}
    onClose={() => setShowPrintModal(false)}
  />
)}


      {/* Gallery */}
      <h2>📂 Gallery</h2>
      <div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        {photos.map((photo, index) => (
          <div key={index} style={{ margin: "10px", textAlign: "center" }}>
            <img
              src={photo}
              alt={`Ảnh số ${index}`}
              style={{
                width: "100px",
                height: "100px",
                border: selectedPhotos.includes(index)
                  ? "2px solid red"
                  : "1px solid #000",
                cursor: "pointer",
              }}
              onClick={() => toggleSelect(index)}
            />
            <div>
              <button onClick={() => printPhoto(photo)}>🖨️ Print</button>
            </div>
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default App;
