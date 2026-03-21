
import React, { useState, useRef, useEffect, useMemo } from "react";
import PrintModal  from "../src/component/printer.js"
import Home from "./Home";
import Admin from "./Admin";
import SettingsModal from "./SettingsModal";
import LayoutModal from "./LayoutModal";
import FrameModal from "./FrameModal";
import { generateSampleFrame } from "./helpers";
import QrModal from "./QrModal";
import FilterModal from "./FilterModal";
import GalleryModal from "./GalleryModal";

function App() {
  const [showPrintModal, setShowPrintModal] = useState(false);
const [photoToPrint, setPhotoToPrint] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const [view, setView] = useState("landing"); // "landing" hoặc "app"
  const [accessToken, setAccessToken] = useState(null); // Token Google Drive
  const [qrLink, setQrLink] = useState(""); // Link ảnh Drive để tạo QR

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [rawPhotos, setRawPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [settings, setSettings] = useState({
    countdown: 3,
    photoCount: 3,
    layout: "vertical-3", // Mặc định là 3 ảnh dọc
    interval: 2,
    filter: "none",
    frame: null,
    useDrive: false, // Bật tắt lưu Google Drive
  });
  const [directoryHandle, setDirectoryHandle] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewVideoRef = useRef(null);

  useEffect(() => {
    if (previewVideoRef.current && stream) {
      previewVideoRef.current.srcObject = stream;
    }
  }, [stream, showSettingsModal]);

  // Tự động sinh danh sách Frame mẫu khớp với layout hiện tại
  const sampleFrames = useMemo(() => {
    return [
      { id: "tet", src: generateSampleFrame("tet", settings.layout), label: "Tết Nguyên Đán" },
      { id: "sen", src: generateSampleFrame("sen", settings.layout), label: "Hoa Sen" },
      { id: "dongson", src: generateSampleFrame("dongson", settings.layout), label: "Trống Đồng" },
      { id: "hoian", src: generateSampleFrame("hoian", settings.layout), label: "Phố Cổ Hội An" },
      { id: "aodai", src: generateSampleFrame("aodai", settings.layout), label: "Áo Dài" },
      { id: "nonla", src: generateSampleFrame("nonla", settings.layout), label: "Nón Lá" },
      { id: "cafe", src: generateSampleFrame("cafe", settings.layout), label: "Cà Phê Sữa" },
      { id: "tre", src: generateSampleFrame("tre", settings.layout), label: "Tre Làng" },
      { id: "ruongbac", src: generateSampleFrame("ruongbac", settings.layout), label: "Ruộng Bậc Thang" },
      { id: "halong", src: generateSampleFrame("halong", settings.layout), label: "Vịnh Hạ Long" },
      { id: "xichlo", src: generateSampleFrame("xichlo", settings.layout), label: "Xích Lô" },
      { id: "hanoi", src: generateSampleFrame("hanoi", settings.layout), label: "Mùa Thu Hà Nội" },
      { id: "saigon", src: generateSampleFrame("saigon", settings.layout), label: "Đêm Sài Gòn" },
      { id: "muaroi", src: generateSampleFrame("muaroi", settings.layout), label: "Múa Rối Nước" },
      { id: "chimlac", src: generateSampleFrame("chimlac", settings.layout), label: "Chim Lạc" },
      { id: "denlong", src: generateSampleFrame("denlong", settings.layout), label: "Đêm Lồng Đèn" },
      { id: "trongcom", src: generateSampleFrame("trongcom", settings.layout), label: "Trống Cơm" },
      { id: "banto", src: generateSampleFrame("banto", settings.layout), label: "Hoa Văn Thổ Cẩm" },
      { id: "nhatrang", src: generateSampleFrame("nhatrang", settings.layout), label: "Biển Xanh" },
      { id: "nemchua", src: generateSampleFrame("nemchua", settings.layout), label: "Đặc Sản" },
    ];
  }, [settings.layout]);

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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);
  const [currentSessionPhotos, setCurrentSessionPhotos] = useState([]);
  
  async function clgcapturePhoto() {
    // logic chụp và lưu ảnh
    console.log("Ảnh đã chụp và lưu!");
    console.log(stream);

  }

  // --- GOOGLE DRIVE & LOGIN ---
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleGoogleLogin = () => {
    if (!window.google) {
      alert("Đang tải thư viện Google, vui lòng thử lại sau giây lát.");
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.file email profile",
      callback: (response) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
          setSettings({ ...settings, useDrive: true });
          setView("app"); // Đăng nhập xong chuyển vào màn hình App
        }
      },
    });
    client.requestAccessToken();
  };

  const uploadToGoogleDrive = async (base64Data) => {
    if (!accessToken) return null;
    try {
      const metadata = { name: `Photobooth_${Date.now()}.png`, mimeType: "image/png" };
      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      const res = await fetch(base64Data);
      const blob = await res.blob();
      form.append("file", blob);

      // 1. Upload file lên Drive
      const uploadRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink", {
        method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form,
      });
      const fileData = await uploadRes.json();

      // 2. Mở quyền công khai để ai quét QR cũng xem được ảnh
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
        method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: "reader", type: "anyone" }),
      });
      return fileData.webViewLink; // Link ảnh public
    } catch (error) { console.error("Lỗi upload Drive:", error); return null; }
  };

  // Hàm cho phép người dùng chọn thư mục lưu ảnh trên máy tính
  const selectDirectory = async () => {
    if (!window.showDirectoryPicker) {
      alert("Trình duyệt của bạn không hỗ trợ tính năng lưu tự động. Vui lòng sử dụng Google Chrome hoặc Microsoft Edge trên máy tính.");
      return;
    }
    try {
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
    } catch (error) {
      console.error("Lỗi chọn thư mục:", error);
    }
  };

  // Hàm tự động ghi file ảnh vào thư mục đã chọn
  const saveImageToLocal = async (dataUrl, filename) => {
    if (!directoryHandle) return;
    try {
      const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      console.error("Lỗi lưu file vào máy:", error);
    }
  };

  const captureWithSettings = async () => {
    let currentPhotos = [...currentSessionPhotos];
    let startIndex = 1;

    if (settings.interval > 0 || currentPhotos.length === 0 || currentPhotos.length >= settings.photoCount) {
      currentPhotos = [];
      startIndex = 1;
    } else {
      startIndex = currentPhotos.length + 1;
    }
    setCurrentPhotoIndex(startIndex);

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
    
    let p = capturePhoto(startIndex);
    if (p) {
      currentPhotos.push(p);
      setRawPhotos(prev => [...prev, p]); // Lưu ngay ảnh gốc vừa chụp vào thư viện
    }

    if (settings.interval > 0) {
      // Chụp các ảnh tiếp theo tự động
      for (let i = 1; i < settings.photoCount; i++) {
        setCurrentPhotoIndex(i + 1); 
        
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

        const capturedImg = capturePhoto(i + 1);
        if (capturedImg) {
          currentPhotos.push(capturedImg);
          setRawPhotos(prev => [...prev, capturedImg]); // Lưu các ảnh gốc tiếp theo
        }
      }
    } else {
      // Chế độ thủ công: Lưu trạng thái và chờ bấm nút tiếp theo
      setCurrentSessionPhotos(currentPhotos);
      if (currentPhotos.length < settings.photoCount) {
        setCurrentPhotoIndex(`${currentPhotos.length} / ${settings.photoCount} (Chờ chụp tiếp)`);
        return;
      }
    }
    
    // Khi đã chụp đủ ảnh
    setCurrentPhotoIndex(null); 
    setCurrentSessionPhotos([]); 

    // Tiến hành ghép ảnh tự động với Frame đã setup và IN NGAY
    const finalImage = await generateCollage(currentPhotos, settings);
    
    // Nếu bật Google Drive thì tự động Upload và hiện QR
    if (settings.useDrive && accessToken) {
      const link = await uploadToGoogleDrive(finalImage);
      if (link) {
        setQrLink(link);
        setShowQrModal(true);
      }
    }

    printPhoto(finalImage);
  };
///////////////////////////////////////////////
  // Bắt đầu camera
  const startCamera = (deviceIdToStart) => {
    const id = deviceIdToStart || selectedDevice;
    if (!id) return;
    navigator.mediaDevices
      .getUserMedia({ video: { deviceId: id } })
      .then((s) => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => console.error("Lỗi truy cập camera:", err));
  };

  const generateCollage = async (images, currentSettings) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const layout = currentSettings.layout || "vertical-3";

    // Kích thước chuẩn khổ giấy ảnh 4x6 inch (A6) chất lượng cao
    const A6_WIDTH = 1200;
    const A6_HEIGHT = 1800;

    // Xác định kích thước canvas dọc hay ngang
    if (layout === "single" || layout === "grid-4") {
      canvas.width = A6_HEIGHT;  // Ngang 1800
      canvas.height = A6_WIDTH;  // 1200
    } else {
      canvas.width = A6_WIDTH;   // Dọc 1200
      canvas.height = A6_HEIGHT; // 1800
    }

    // Tô nền trắng
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Chuyển Base64 thành Image object
    const loadedImages = await Promise.all(
      images.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
          })
      )
    );

    // Vẽ từng ảnh lên Canvas dựa theo mẫu (Layout) thực tế
    loadedImages.forEach((img, index) => {
      let dx = 0, dy = 0, dw = 0, dh = 0;

      if (layout === "single") {
        // 1 ảnh lớn giữa khổ ngang 1800x1200
        dw = 1500; dh = 1000; dx = 150; dy = 100;
      } else if (layout === "vertical-2") {
        // 2 ảnh dọc
        dw = 1050; dh = 700; dx = 75; dy = 133 + index * 833;
      } else if (layout === "vertical-3") {
        // 3 ảnh dọc
        dw = 840; dh = 560; dx = 180; dy = 30 + index * 590;
      } else if (layout === "grid-4") {
        // Lưới 4 ảnh 2x2 trên khổ ngang 1800x1200
        dw = 800; dh = 533;
        let col = index % 2;
        let row = Math.floor(index / 2);
        dx = 66 + col * 868;
        dy = 44 + row * 579;
      } else if (layout === "grid-6") {
        // Lưới 6 ảnh 2x3 trên khổ dọc 1200x1800
        dw = 500; dh = 333;
        let col = index % 2;
        let row = Math.floor(index / 2);
        dx = 66 + col * 568; 
        dy = 200 + row * 450;
      } else if (layout === "grid-8") {
        // Lưới 8 ảnh 2x4 trên khổ dọc 1200x1800
        dw = 510; dh = 340;
        let col = index % 2;
        let row = Math.floor(index / 2);
        dx = 60 + col * 570; 
        dy = 88 + row * 428;
      }

      // Áp dụng filter trước khi vẽ từng ảnh nếu có
      if (currentSettings.filter && currentSettings.filter !== "none") {
        ctx.filter = currentSettings.filter;
      } else {
        ctx.filter = "none";
      }
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.filter = "none"; // reset filter
    });

    // Vẽ Frame nếu có (đè lên trên cùng)
    if (currentSettings.frame) {
      const frameImg = new Image();
      await new Promise((resolve) => {
        frameImg.onload = resolve;
        frameImg.src = currentSettings.frame;
      });
      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    }

    // Xuất ra Base64 và lưu vào Gallery
    const finalResult = canvas.toDataURL("image/png");
    setPhotos((prev) => [...prev, finalResult]);
    
    // Tự động lưu ảnh ghép (Collage) vào thư mục trên máy tính
    if (directoryHandle) {
      saveImageToLocal(finalResult, `photobooth_collage_${Date.now()}.png`);
    }

    return finalResult;
  };

  const PHOTO_WIDTH = 600;
  const PHOTO_HEIGHT = 400;
  const capturePhoto = (index = 1) => {
    // Phát âm thanh tiếng "tách"
    const shutterSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
    shutterSound.play().catch(e => console.error("Lỗi phát âm thanh:", e));
    
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      canvas.width = PHOTO_WIDTH;
      canvas.height = PHOTO_HEIGHT;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(video, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      
      const dataUrl = canvas.toDataURL("image/png");
      
      // Tự động lưu từng bức ảnh gốc chưa ghép vào máy
      if (directoryHandle) {
        saveImageToLocal(dataUrl, `raw_${Date.now()}_${index}.png`);
      }

      return dataUrl;
    }
    return null;
  };


  // Chọn ảnh
  const toggleSelect = (url) => {
    if (selectedPhotos.includes(url)) {
      setSelectedPhotos((prev) => prev.filter((i) => i !== url));
    } else {
      setSelectedPhotos((prev) => [...prev, url]);
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

  // --- GIAO DIỆN LANDING PAGE ---
  if (view === "landing") return <Home onLogin={handleGoogleLogin} onStartOffline={() => setView("app")} onGoToAdmin={() => setView("admin")} />;
  if (view === "admin") return <Admin onBack={() => setView("landing")} />;
  // --- KẾT THÚC LANDING PAGE ---

  return (
    <div className="booth-container">
      <style>{`
        .hover-btn {
          transition: all 0.3s ease-in-out;
        }
        .hover-btn:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }
      `}</style>
      <h1>Photobooth 🎉</h1>

      {/* --- MÀN HÌNH CHỤP ẢNH (CAMERA MODE) --- */}
        <div className="camera-mode">
          <div className="controls-container" style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "15px" }}>
            <button 
              className="hover-btn"
              onClick={() => setShowSettingsModal(true)} 
              style={{ padding: "10px 24px", fontSize: "16px", fontWeight: "bold", color: "#fff", backgroundColor: "#4f46e5", border: "none", borderRadius: "30px", cursor: "pointer", boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)", display: "flex", alignItems: "center", gap: "8px" }}
            >
              ⚙️ Cài đặt
            </button>
            <button 
              className="hover-btn"
              onClick={() => setShowLayoutModal(true)} 
              style={{ padding: "10px 24px", fontSize: "16px", fontWeight: "bold", color: "#fff", backgroundColor: "#f59e0b", border: "none", borderRadius: "30px", cursor: "pointer", boxShadow: "0 4px 10px rgba(245, 158, 11, 0.3)", display: "flex", alignItems: "center", gap: "8px" }}
            >
              📐 Chọn Layout
            </button>
            <button 
              className="hover-btn"
              onClick={() => setShowFrameModal(true)} 
              style={{ padding: "10px 24px", fontSize: "16px", fontWeight: "bold", color: "#fff", backgroundColor: "#8b5cf6", border: "none", borderRadius: "30px", cursor: "pointer", boxShadow: "0 4px 10px rgba(139, 92, 246, 0.3)", display: "flex", alignItems: "center", gap: "8px" }}
            >
              🖼️ Chọn Frame
            </button>
            <button 
              className="hover-btn"
              onClick={() => setShowGalleryModal(true)} 
              style={{ padding: "10px 24px", fontSize: "16px", fontWeight: "bold", color: "#fff", backgroundColor: "#10b981", border: "none", borderRadius: "30px", cursor: "pointer", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: "8px" }}
            >
              📂 Gallery
            </button>
          </div>

          <div style={{ position: "relative", display: "inline-block" }}>
            <video
              ref={videoRef}
              autoPlay
              style={{ width: `${PHOTO_WIDTH}px`, height: `${PHOTO_HEIGHT}px`, border: "1px solid #ccc", filter: settings.filter }}
            />
            {/* Overlays... */}
            {currentPhotoIndex !== null && (
              <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", color: "white", padding: "8px 20px", borderRadius: "20px", fontSize: "20px", fontWeight: "bold", zIndex: 10 }}>
                📸 Đang chụp: {currentPhotoIndex} {typeof currentPhotoIndex === 'number' ? `/ ${settings.photoCount}` : ''}
              </div>
            )}
            {countdownValue !== null && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "80px", color: "white", textShadow: "0 0 20px red, 0 0 10px red", fontWeight: "900", zIndex: 10 }}>{countdownValue}</div>
            )}
            {intervalValue !== null && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "80px", color: "white", textShadow: "0 0 20px blue, 0 0 10px blue", fontWeight: "900", zIndex: 10 }}>{intervalValue}</div>
            )}
          </div>

          <div className="booth-footer" style={{ display: "flex", justifyContent: "center", margin: "30px 0" }}>
            <button onClick={captureWithSettings} className="hover-btn" style={{ padding: "18px 50px", fontSize: "28px", fontWeight: "900", color: "#fff", background: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)", border: "none", borderRadius: "50px", cursor: "pointer", boxShadow: "0 10px 20px rgba(255, 8, 68, 0.4)", textTransform: "uppercase", letterSpacing: "2px" }}>
              {settings.interval === 0 && currentSessionPhotos.length > 0 ? "📸 CHỤP TIẾP" : "📸 START"}
            </button>
          </div>
        </div>

      {/* Các Modals đã được tách ra file riêng để code gọn gàng */}
      <SettingsModal show={showSettingsModal} onClose={() => setShowSettingsModal(false)} devices={devices} selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice} startCamera={startCamera} previewVideoRef={previewVideoRef} stream={stream} settings={settings} setSettings={setSettings} selectDirectory={selectDirectory} directoryHandle={directoryHandle} accessToken={accessToken} />
      <LayoutModal show={showLayoutModal} onClose={() => setShowLayoutModal(false)} settings={settings} setSettings={setSettings} />
      <FrameModal show={showFrameModal} onClose={() => setShowFrameModal(false)} settings={settings} setSettings={setSettings} sampleFrames={sampleFrames} />
      <FilterModal show={showFilterModal} onClose={() => setShowFilterModal(false)} settings={settings} setSettings={setSettings} />
      <GalleryModal show={showGalleryModal} onClose={() => setShowGalleryModal(false)} photos={photos} rawPhotos={rawPhotos} selectedPhotos={selectedPhotos} toggleSelect={toggleSelect} printPhoto={printPhoto} onPrintAny={() => setShowPrintModal(true)} />
      <QrModal show={showQrModal} onClose={() => setShowQrModal(false)} qrLink={qrLink} />
      {showPrintModal && <PrintModal photoUrl={photoToPrint} onClose={() => setShowPrintModal(false)} />}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default App;
