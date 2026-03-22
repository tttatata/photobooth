
import React, { useState, useRef, useEffect } from "react";
import PrintModal from "./component/printer.js";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import SettingsModal from "./component/SettingsModal";
import LayoutModal from "./component/LayoutModal";
import FrameModal from "./component/FrameModal";
import QrModal from "./component/QrModal";
import GalleryModal from "./component/GalleryModal";
import DrivePickerModal from "./component/DrivePickerModal";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";

// Danh sách các Filter CSS miễn phí (Sử dụng CSS3 Filters siêu mượt, không cần cài thêm thư viện)
const AVAILABLE_FILTERS = [
  { id: "none", label: "Mặc định", filter: "none", icon: "🌈" },
  { id: "beauty", label: "Làm đẹp", filter: "blur(0.5px) brightness(1.15) contrast(0.9) saturate(1.1)", icon: "🌸" },
  { id: "grayscale", label: "Trắng đen", filter: "grayscale(100%)", icon: "🎞️" },
  { id: "sepia", label: "Cổ điển", filter: "sepia(100%)", icon: "🟤" },
  { id: "vintage", label: "Vintage", filter: "sepia(50%) hue-rotate(-30deg) saturate(140%)", icon: "📽️" },
  { id: "cool", label: "Sắc Lạnh", filter: "hue-rotate(180deg) saturate(150%)", icon: "❄️" },
  { id: "warm", label: "Ấm áp", filter: "sepia(30%) saturate(140%) hue-rotate(-15deg)", icon: "☀️" },
  { id: "bright", label: "Tươi sáng", filter: "brightness(1.2) contrast(1.2) saturate(120%)", icon: "✨" },
  { id: "fade", label: "Sương mù", filter: "opacity(0.8) saturate(80%) brightness(1.2)", icon: "🌫️" },
];

function PhotoboothMain() {
  const navigate = useNavigate();
  const [showPrintModal, setShowPrintModal] = useState(false);
const [photoToPrint, setPhotoToPrint] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showFolderQrModal, setShowFolderQrModal] = useState(false);
  const [showDrivePickerModal, setShowDrivePickerModal] = useState(false);
  const [folderQrLink, setFolderQrLink] = useState("");

  const [accessToken, setAccessToken] = useState(null); // Token Google Drive

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [rawPhotos, setRawPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [customFrames, setCustomFrames] = useState([]); // Chứa frames từ Backend
  const [settings, setSettings] = useState({
    countdown: 3,
    photoCount: 3,
    layout: "vertical-3", // Mặc định là 3 ảnh dọc
    interval: 2,
    filter: "none",
    frame: null,
    useDrive: false, // Bật tắt lưu Google Drive
    driveFolderId: "", // Thư mục Drive lưu ảnh
    uploadRawPhotos: false, // Bật tắt lưu ảnh lẻ chưa ghép lên Drive
  });
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [driveFolders, setDriveFolders] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewVideoRef = useRef(null);

  // Tải danh sách Frame từ Backend (Database) khi khởi động màn hình chụp
  useEffect(() => {
    const fetchCustomFrames = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/frames`);
        const data = await response.json();
        if (data.success) {
          setCustomFrames(data.frames.map(f => ({ id: f._id, src: f.image, label: f.name })));
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách frame từ backend:", error);
      }
    };
    fetchCustomFrames();
  }, []);

  useEffect(() => {
    if (previewVideoRef.current && stream) {
      previewVideoRef.current.srcObject = stream;
    }
  }, [stream, showSettingsModal]);

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

  // Tự động chèn script tải thư viện Google khi chạy ứng dụng
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const [intervalValue, setIntervalValue] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);
  const [currentSessionPhotos, setCurrentSessionPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false); // Trạng thái hiển thị thông báo "Đang chụp..."
  const [isSessionActive, setIsSessionActive] = useState(false); // Trạng thái phiên chụp đang chạy
  const abortCaptureRef = useRef(false); // Cờ tín hiệu để hủy tiến trình
  
  // Tự động tải danh sách thư mục do ứng dụng tạo trên Drive
  useEffect(() => {
    if (accessToken) {
      const fetchDriveFolders = async () => {
        try {
          const res = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name,webViewLink)", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await res.json();
          if (data.files) {
            // Chuẩn hóa link để luôn hiển thị dưới dạng Shared Link
            const folders = data.files.map(f => ({
              ...f, webViewLink: `https://drive.google.com/drive/folders/${f.id}?usp=sharing`
            }));
            setDriveFolders(folders);
          }
        } catch (error) {
          console.error("Lỗi lấy danh sách thư mục:", error);
        }
      };
      fetchDriveFolders();
    }
  }, [accessToken]);

  // Hàm tạo thư mục mới trên Google Drive
  const createDriveFolder = async (folderName) => {
    if (!accessToken) return;
    try {
      const metadata = { name: folderName, mimeType: "application/vnd.google-apps.folder" };
      const res = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });
      const data = await res.json();
      if (data.id) {
        // Mở quyền truy cập công khai cho thư mục để ai cũng xem được khi quét QR
        const permRes = await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
          method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ role: "reader", type: "anyone" }),
        });

        if (!permRes.ok) {
          console.error("Lỗi cấp quyền Public:", await permRes.text());
          alert("⚠️ Thư mục đã được tạo nhưng KHÔNG THỂ bật Public!\n\nLý do: Tài khoản Google (Công ty/Trường học) của bạn bị Quản trị viên chặn chia sẻ ra ngoài.\n👉 Khắc phục: Vui lòng đăng xuất và dùng tài khoản @gmail.com cá nhân.");
        }

        // Tạo link chia sẻ chuẩn để khách quét là vào thẳng ảnh
        const shareLink = `https://drive.google.com/drive/folders/${data.id}?usp=sharing`;
        const newFolder = { ...data, webViewLink: shareLink };

        setDriveFolders((prev) => [...prev, newFolder]);
        setSettings((prev) => ({ ...prev, driveFolderId: data.id }));
        
        setFolderQrLink(shareLink);
        setShowFolderQrModal(true);
      }
    } catch (error) {
      console.error("Lỗi tạo thư mục:", error);
    }
  };

  // Hàm hiển thị QR của thư mục đã chọn
  const showSelectedFolderQr = (folderId) => {
    const folder = driveFolders.find(f => f.id === folderId);
    if (folder) {
      setFolderQrLink(folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}?usp=sharing`);
      setShowFolderQrModal(true);
    } else {
      alert("Chưa lấy được link hoặc thư mục chưa có quyền xem. Vui lòng tạo thư mục mới.");
    }
  };

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
      callback: async (response) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
          setSettings({ ...settings, useDrive: true });
          
          try {
            // 1. Lấy thông tin user (email, name) từ Google bằng access_token
            const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });
            const userInfo = await userInfoRes.json();
            
            // 2. Gửi thông tin này lên Backend để kiểm tra và lưu vào MongoDB
            const backendRes = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: userInfo.email, name: userInfo.name })
            });
            
            const backendData = await backendRes.json();
            if (backendData.success) {
              localStorage.setItem("token", backendData.token); // Lưu token từ Server để giữ đăng nhập
              localStorage.setItem("userRole", backendData.user.role); // Lưu phân quyền từ Server
              localStorage.setItem("userName", backendData.user.username); // Lưu tên tài khoản hiển thị
              navigate("/app"); // Chuyển vào màn hình chụp
            } else {
              alert(backendData.message || "Không thể đăng nhập vào hệ thống.");
            }
          } catch (error) {
            console.error("Lỗi xác thực Backend:", error);
            alert("Lỗi kết nối đến máy chủ Backend!");
          }
        }
      },
    });
    client.requestAccessToken();
  };

  const uploadToGoogleDrive = async (base64Data, fileName = `Photobooth_${Date.now()}.png`) => {
    if (!accessToken) return null;
    try {
      const metadata = { name: fileName, mimeType: "image/png" };
      if (settings.driveFolderId) {
        metadata.parents = [settings.driveFolderId]; // Nếu có chọn thư mục thì gán ID vào đây
      }
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

  // Hàm xử lý khi bấm nút Hủy Chụp
  const cancelSession = () => {
    abortCaptureRef.current = true; // Kích hoạt cờ hủy cho các vòng lặp đang chạy
    if (!isSessionActive) {
      // Nếu đang ở trạng thái chờ (Chế độ thủ công), dọn dẹp ngay lập tức
      setCountdownValue(null);
      setIntervalValue(null);
      setIsCapturing(false);
      setCurrentPhotoIndex(null);
      setRawPhotos(prev => prev.slice(0, prev.length - currentSessionPhotos.length));
      setCurrentSessionPhotos([]);
    }
  };

  const captureWithSettings = async () => {
    abortCaptureRef.current = false;
    setIsSessionActive(true);

    let currentPhotos = [...currentSessionPhotos];
    let startIndex = 1;

    if (settings.interval > 0 || currentPhotos.length === 0 || currentPhotos.length >= settings.photoCount) {
      currentPhotos = [];
      startIndex = 1;
    } else {
      startIndex = currentPhotos.length + 1;
    }
    setCurrentPhotoIndex(startIndex);

    // Hàm dọn dẹp nếu tiến trình bị hủy giữa chừng
    const cleanupAbortedSession = () => {
      setCountdownValue(null);
      setIntervalValue(null);
      setIsCapturing(false);
      setCurrentPhotoIndex(null);
      setCurrentSessionPhotos([]);
      setIsSessionActive(false);
      // Xóa bỏ các ảnh thô đã chụp dở dang trong phiên này khỏi thư viện
      setRawPhotos(prev => prev.slice(0, prev.length - currentPhotos.length));
    };

    // Đếm ngược trước khi chụp ảnh đầu tiên
    let timeLeft = settings.countdown;
    if (timeLeft > 0) {
      setCountdownValue(timeLeft);
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (abortCaptureRef.current) {
            clearInterval(interval);
            resolve();
            return;
          }
          timeLeft -= 1;
          if (timeLeft > 0) {
            setCountdownValue(timeLeft);
          } else {
            clearInterval(interval);
            setCountdownValue(null);
            resolve();
          }
        }, 1000);
      });
    } else {
      setCountdownValue(null);
    }

    if (abortCaptureRef.current) {
      cleanupAbortedSession();
      return;
    }

    // Bật chữ "Đang chụp..." và đợi 0.5s để người dùng tạo dáng cuối
    setIsCapturing(true);
    await new Promise(resolve => {
      let ticks = 0;
      const t = setInterval(() => {
        ticks += 100;
        if (abortCaptureRef.current || ticks >= 500) { clearInterval(t); resolve(); }
      }, 100);
    }); 

    if (abortCaptureRef.current) { cleanupAbortedSession(); return; }

    //thông báo ảnh đã
 await clgcapturePhoto();
    
    let p = capturePhoto(startIndex);
    if (p) {
      currentPhotos.push(p);
      setRawPhotos(prev => [...prev, p]); // Lưu ngay ảnh gốc vừa chụp vào thư viện
    }
    setIsCapturing(false); // Tắt chữ "Đang chụp..."

    if (settings.interval > 0) {
      // Chụp các ảnh tiếp theo tự động
      for (let i = 1; i < settings.photoCount; i++) {
        if (abortCaptureRef.current) break;

        setCurrentPhotoIndex(i + 1); 
        
        let timeLeft = settings.interval;
        if (timeLeft > 0) {
          setIntervalValue(timeLeft);
          await new Promise((resolve) => {
            const interval = setInterval(() => {
              if (abortCaptureRef.current) {
                clearInterval(interval);
                resolve();
                return;
              }
              timeLeft -= 1;
              if (timeLeft > 0) {
                setIntervalValue(timeLeft);
              } else {
                clearInterval(interval);
                setIntervalValue(null);
                resolve();
              }
            }, 1000);
          });
        } else {
          setIntervalValue(null);
        }

        if (abortCaptureRef.current) break;

        setIsCapturing(true);
        await new Promise(resolve => {
          let ticks = 0;
          const t = setInterval(() => {
            ticks += 100;
            if (abortCaptureRef.current || ticks >= 500) { clearInterval(t); resolve(); }
          }, 100);
        });

        if (abortCaptureRef.current) break;

        const capturedImg = capturePhoto(i + 1);
        if (capturedImg) {
          currentPhotos.push(capturedImg);
          setRawPhotos(prev => [...prev, capturedImg]); // Lưu các ảnh gốc tiếp theo
        }
        setIsCapturing(false);
      }
    } else {
      // Chế độ thủ công: Lưu trạng thái và chờ bấm nút tiếp theo
      if (!abortCaptureRef.current) {
        setCurrentSessionPhotos(currentPhotos);
        if (currentPhotos.length < settings.photoCount) {
          setCurrentPhotoIndex(`${currentPhotos.length} / ${settings.photoCount} (Chờ chụp tiếp)`);
          setIsSessionActive(false);
          return;
        }
      }
    }
    
    if (abortCaptureRef.current) {
      cleanupAbortedSession();
      return;
    }

    // Khi đã chụp đủ ảnh
    setCurrentPhotoIndex(null); 
    setCurrentSessionPhotos([]); 
    setIsSessionActive(false);

    // Tiến hành ghép ảnh tự động với Frame đã setup và IN NGAY
    const finalImage = await generateCollage(currentPhotos, settings);
    
    // Nếu bật Google Drive thì tự động Upload vào thư mục đã chọn
    if (settings.useDrive && accessToken) {
      await uploadToGoogleDrive(finalImage);
      
      // Nếu bật tính năng upload ảnh lẻ
      if (settings.uploadRawPhotos) {
        for (let i = 0; i < currentPhotos.length; i++) {
          await uploadToGoogleDrive(currentPhotos[i], `Raw_Photo_${Date.now()}_${i + 1}.png`);
        }
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

    // --- BƯỚC 1: VẼ HÌNH ẢNH CHỤP LÊN TRƯỚC (NẰM BÊN DƯỚI) ---
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

    // --- BƯỚC 2: VẼ FRAME ĐÈ LÊN TRÊN CÙNG (VẼ TRÊN ẢNH) ---
    // Những ô chứa ảnh của Frame phải trong suốt (Transparent) để lộ ảnh bên dưới ra.
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

  const renderApp = () => (
    <div className="booth-container" style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .hover-btn {
          transition: all 0.3s ease-in-out;
        }
        .hover-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
        .video-wrapper {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          background: #000;
          display: inline-block;
          border: 6px solid #fff;
        }
        .app-header {
          width: 100%;
          max-width: 1000px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .app-title {
          font-size: 32px;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .main-card {
          background: #ffffff;
          border-radius: 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 1000px;
          position: relative;
        }
        .floating-qr {
          position: fixed !important;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          transition: all 0.3s ease-in-out;
          z-index: 1000 !important;
          cursor: zoom-in;
        }
        .floating-qr:hover {
          transform: translateY(-50%) scale(1.8);
          transform-origin: right center;
        }
        @media (max-width: 900px) {
          .floating-qr {
            position: static !important;
            margin-bottom: 25px;
            transform: none !important;
          }
          .floating-qr:hover {
            transform: scale(1.1) !important;
            transform-origin: center center;
          }
        }
        .live-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 10;
        }
        .live-badge::before {
          content: '';
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        .filter-sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .filter-sidebar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: bold;
          font-size: 14px;
          white-space: nowrap;
          border: 2px solid transparent;
        }
        .filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
      `}</style>
      
      <div className="app-header">
        <h1 className="app-title">📸 VietBooth Studio</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Hiển thị tên người dùng */}
          {localStorage.getItem("userName") && (
            <span style={{ fontWeight: "bold", color: "#374151", fontSize: "16px" }}>👋 {localStorage.getItem("userName")}</span>
          )}
          <button onClick={() => navigate("/")} className="hover-btn" style={{ padding: "10px 20px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" }}>
            🏠 Về trang chủ
          </button>
          {/* Nút Xóa ảnh */}
          <button onClick={() => {
            if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ ảnh đang lưu tạm thời không?")) {
              setPhotos([]);
              setRawPhotos([]);
            }
          }} className="hover-btn" style={{ padding: "10px 20px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" }}>
            🗑️ Xóa ảnh
          </button>
          {/* Nút Đăng xuất (Hiển thị nếu có token) */}
          {localStorage.getItem("token") && (
            <button onClick={() => {
              localStorage.removeItem("token"); localStorage.removeItem("userRole"); localStorage.removeItem("userName");
              navigate("/");
            }} className="hover-btn" style={{ padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer" }}>
              🚪 Đăng xuất
            </button>
          )}
        </div>
      </div>

      {/* --- MÀN HÌNH CHỤP ẢNH (CAMERA MODE) --- */}
      <div className="main-card">
        
        {/* Mã QR Album hiển thị cố định trên màn hình */}
        {settings.useDrive && settings.driveFolderId && driveFolders.find(f => f.id === settings.driveFolderId) && (
          <div className="floating-qr" style={{ background: "#fff", padding: "15px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", textAlign: "center", border: "4px solid #4f46e5" }}>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#4f46e5", marginBottom: "10px", textTransform: "uppercase" }}>📸 Album Sự kiện</div>
            <img src={`${process.env.REACT_APP_QR_API_URL || "https://api.qrserver.com/v1/create-qr-code/"}?size=150x150&data=${encodeURIComponent(driveFolders.find(f => f.id === settings.driveFolderId)?.webViewLink || `https://drive.google.com/drive/folders/${settings.driveFolderId}?usp=sharing`)}`} alt="Album QR" style={{ width: "150px", height: "150px", display: "block", margin: "0 auto", borderRadius: "8px" }} />
            <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "10px", fontWeight: "bold" }}>Rê chuột vào để phóng to</div>
          </div>
        )}

        <div className="camera-mode" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div className="controls-container" style={{ marginBottom: "30px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px" }}>
            <button 
              className="hover-btn"
              onClick={() => setShowSettingsModal(true)} 
              style={{ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", color: "#4f46e5", backgroundColor: "#e0e7ff", border: "none", borderRadius: "30px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              ⚙️ Cài đặt
            </button>
            <button 
              className="hover-btn"
              onClick={() => setShowLayoutModal(true)} 
              style={{ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", color: "#f59e0b", backgroundColor: "#fef3c7", border: "none", borderRadius: "30px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              📐 Chọn Layout
            </button>
            <button 
              className="hover-btn"
              onClick={() => setShowFrameModal(true)} 
              style={{ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", color: "#8b5cf6", backgroundColor: "#ede9fe", border: "none", borderRadius: "30px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              🖼️ Chọn Frame
            </button>
            <button 
              className="hover-btn"
              onClick={() => setShowGalleryModal(true)} 
              style={{ padding: "12px 24px", fontSize: "16px", fontWeight: "bold", color: "#10b981", backgroundColor: "#d1fae5", border: "none", borderRadius: "30px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              📂 Gallery
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px", alignItems: "stretch", width: "100%" }}>
            
            {/* --- Video Preview --- */}
            <div className="video-wrapper" style={{ width: `${PHOTO_WIDTH}px`, height: `${PHOTO_HEIGHT}px`, backgroundColor: "#e5e7eb", display: "flex", justifyContent: "center", alignItems: "center" }}>
              {stream && <div className="live-badge">LIVE</div>}
              
              {!stream && (
                <div style={{ position: "absolute", textAlign: "center", color: "#6b7280", zIndex: 5, padding: "20px" }}>
                  <div style={{ fontSize: "60px", marginBottom: "15px" }}>📷</div>
                  <h3 style={{ margin: 0, fontSize: "24px", color: "#374151" }}>Chưa có Camera</h3>
                  <p style={{ margin: "10px 0 0 0", fontSize: "16px" }}>Vui lòng chọn Camera trong phần <strong>⚙️ Cài đặt</strong></p>
                </div>
              )}

              <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", filter: settings.filter, display: stream ? "block" : "none", objectFit: "cover" }} />
              {/* Overlays */}
              {isCapturing && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.8)", color: "white", padding: "20px 40px", borderRadius: "30px", fontSize: "30px", fontWeight: "bold", zIndex: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.3)", backdropFilter: "blur(5px)" }}>
                  📸 Đang chụp...
                </div>
              )}
              {currentPhotoIndex !== null && (
                <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", color: "white", padding: "10px 24px", borderRadius: "30px", fontSize: "20px", fontWeight: "bold", zIndex: 10, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                  📸 Đang chụp: {currentPhotoIndex} {typeof currentPhotoIndex === 'number' ? `/ ${settings.photoCount}` : ''}
                </div>
              )}
              {countdownValue !== null && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "120px", color: "white", textShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.4)", fontWeight: "900", zIndex: 10 }}>{countdownValue}</div>
              )}
              {intervalValue !== null && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "120px", color: "white", textShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.4)", fontWeight: "900", zIndex: 10 }}>{intervalValue}</div>
              )}
            </div>

            {/* --- Thanh Sidebar Cuộn Chọn Filter --- */}
            <div className="filter-sidebar" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: `${PHOTO_HEIGHT}px`, overflowY: "auto", paddingRight: "10px" }}>
              {AVAILABLE_FILTERS.map(f => (
                <div key={f.id} className="filter-btn" onClick={() => setSettings({ ...settings, filter: f.filter })} style={{ background: settings.filter === f.filter ? "#e0e7ff" : "#f9fafb", color: settings.filter === f.filter ? "#4f46e5" : "#4b5563", border: settings.filter === f.filter ? "2px solid #4f46e5" : "2px solid #e5e7eb" }}>
                  <span style={{ fontSize: "20px" }}>{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>

          </div>

          {stream && (
            <div className="booth-footer" style={{ display: "flex", justifyContent: "center", marginTop: "40px", gap: "15px" }}>
              {!isSessionActive ? (
                <>
                  <button onClick={captureWithSettings} className="hover-btn" style={{ padding: "20px 60px", fontSize: "24px", fontWeight: "900", color: "#fff", background: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)", border: "none", borderRadius: "50px", cursor: "pointer", boxShadow: "0 15px 30px rgba(255, 8, 68, 0.3)", textTransform: "uppercase", letterSpacing: "2px", display: "flex", alignItems: "center", gap: "10px" }}>
                    {settings.interval === 0 && currentSessionPhotos.length > 0 ? "📸 CHỤP TIẾP" : "📸 START"}
                  </button>
                  {settings.interval === 0 && currentSessionPhotos.length > 0 && (
                    <button onClick={cancelSession} className="hover-btn" style={{ padding: "20px 40px", fontSize: "18px", fontWeight: "bold", color: "#ef4444", background: "#fee2e2", border: "none", borderRadius: "50px", cursor: "pointer", textTransform: "uppercase" }}>
                      ❌ Hủy
                    </button>
                  )}
                </>
              ) : (
                <button onClick={cancelSession} className="hover-btn" style={{ padding: "20px 60px", fontSize: "24px", fontWeight: "900", color: "#fff", background: "#ef4444", border: "none", borderRadius: "50px", cursor: "pointer", boxShadow: "0 15px 30px rgba(239, 68, 68, 0.3)", textTransform: "uppercase", letterSpacing: "2px", display: "flex", alignItems: "center", gap: "10px" }}>
                  ❌ HỦY CHỤP
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Các Modals đã được tách ra file riêng để code gọn gàng */}
      <SettingsModal show={showSettingsModal} onClose={() => setShowSettingsModal(false)} devices={devices} selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice} startCamera={startCamera} previewVideoRef={previewVideoRef} stream={stream} settings={settings} setSettings={setSettings} selectDirectory={selectDirectory} directoryHandle={directoryHandle} accessToken={accessToken} driveFolders={driveFolders} createDriveFolder={createDriveFolder} showFolderQr={showSelectedFolderQr} onOpenDrivePicker={() => setShowDrivePickerModal(true)} />
      <DrivePickerModal show={showDrivePickerModal} onClose={() => setShowDrivePickerModal(false)} driveFolders={driveFolders} onSelectFolder={(id) => setSettings({ ...settings, driveFolderId: id })} onCreateFolder={createDriveFolder} selectedFolderId={settings.driveFolderId} />
      <LayoutModal show={showLayoutModal} onClose={() => setShowLayoutModal(false)} settings={settings} setSettings={setSettings} />
      <FrameModal show={showFrameModal} onClose={() => setShowFrameModal(false)} settings={settings} setSettings={setSettings} sampleFrames={customFrames} />
      <GalleryModal show={showGalleryModal} onClose={() => setShowGalleryModal(false)} photos={photos} rawPhotos={rawPhotos} selectedPhotos={selectedPhotos} toggleSelect={toggleSelect} printPhoto={printPhoto} onPrintAny={() => setShowPrintModal(true)} />
      <QrModal show={showFolderQrModal} onClose={() => setShowFolderQrModal(false)} qrLink={folderQrLink} title="📁 Thư mục sự kiện" description="Quét mã QR này để xem và tải về toàn bộ ảnh của sự kiện." />
      {showPrintModal && <PrintModal photoUrl={photoToPrint} onClose={() => setShowPrintModal(false)} />}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );

  // Định tuyến các màn hình chính
  return (
    <Routes>
      <Route path="/" element={<Home onLogin={handleGoogleLogin} onStartOffline={() => navigate("/app")} onGoToAdmin={() => navigate("/admin")} />} />
      <Route 
        path="/admin" 
        element={
          localStorage.getItem("token") && localStorage.getItem("userRole") === "admin" ? (
            <Admin onBack={() => navigate("/")} />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
      <Route path="/app" element={renderApp()} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <PhotoboothMain />
    </Router>
  );
}

export default App;
