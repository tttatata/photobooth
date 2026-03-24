
import React, { useState, useRef, useEffect, useMemo } from "react";
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
import AppHeader from "./component/AppHeader";
import FloatingQR from "./component/FloatingQR";
import MobileQrButton from "./component/MobileQrButton";
import FilterSelector from "./component/FilterSelector";
import MobileControls from "./component/MobileControls";
import DesktopControls from "./component/DesktopControls";
import CaptureActionButtons from "./component/CaptureActionButtons";


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

  // State kiểm tra giao diện Mobile / Desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [stream, setStream] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false); // Trạng thái loading khi đổi Camera
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

  const fetchCustomFrames = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/frames`, { headers });
      const data = await response.json();
      if (data.success) {
          const framesList = data.frames.map(f => ({ id: f._id, src: f.image, label: f.name, layout: f.layout }));
          setCustomFrames(framesList);
          
          // Tự động khôi phục Frame từ Database nếu trước đó đã chọn
          setSettings(prev => {
            if (prev.frameId && prev.frameId !== "local" && !prev.frame) {
              const matchedFrame = framesList.find(fr => fr.id === prev.frameId);
              if (matchedFrame) return { ...prev, frame: matchedFrame.src };
            }
            return prev;
          });
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách frame từ backend:", error);
    }
  };

  // Tải danh sách Frame từ Backend (Database) khi khởi động màn hình chụp
  useEffect(() => {
    fetchCustomFrames();
  }, []);

  // Tự động lưu cài đặt vào bộ nhớ đệm (localStorage) mỗi khi có thay đổi
  useEffect(() => {
    const settingsToSave = { ...settings };
    delete settingsToSave.frame; // Chắc chắn 100% không lưu chuỗi ảnh khổng lồ
    try {
      localStorage.setItem("photoboothSettings", JSON.stringify(settingsToSave));
    } catch (e) {
      console.warn("Bộ nhớ trình duyệt đầy, đang thử dọn dẹp...", e);
      try {
        localStorage.removeItem("localPersonalFrame"); // Xóa bớt ảnh upload cục bộ để lấy chỗ trống
        localStorage.setItem("photoboothSettings", JSON.stringify(settingsToSave));
      } catch (err) { console.error("Hoàn toàn không thể lưu do lỗi trình duyệt:", err); }
    }
  }, [settings]);

  // Tự động sinh danh sách Frame mẫu và gộp với Frame tùy chỉnh từ Cơ sở dữ liệu
  const sampleFrames = useMemo(() => {
    // Lọc các frame được upload từ database theo layout người dùng đang chọn
    // Những frame cũ không có trường layout sẽ mặc định được hiểu là "vertical-3"
    const filteredCustomFrames = customFrames.filter(frame => (frame.layout || "vertical-3") === settings.layout);
    return filteredCustomFrames;
  }, [settings.layout, customFrames]); // Update lại danh sách khi người dùng đổi Layout hoặc có Custom Frame mới tải xuống

  useEffect(() => {
    if (previewVideoRef.current && stream) {
      previewVideoRef.current.srcObject = stream;
    }
  }, [stream, showSettingsModal]);

  // Đảm bảo Stream Camera luôn gắn đúng vào VideoRef khi chuyển đổi Mobile/Desktop
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isMobile]);

  // Tự động quét và kết nối máy ảnh khi cắm cáp thiết bị mới
  useEffect(() => {
    const handleDeviceChange = async () => {
      try {
        // Mở luồng phụ để trình duyệt bỏ ẩn tên thiết bị
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === "videoinput");
        setDevices(videoDevices);

        // Kiểm tra xem trước đó người dùng đã tự tay chọn Camera nào chưa
        const savedCameraId = localStorage.getItem("selectedCameraId");
        const savedDevice = videoDevices.find(d => d.deviceId === savedCameraId);

        if (savedDevice) {
          setSelectedDevice(savedDevice.deviceId);
          startCamera(savedDevice.deviceId, true);
        } else {
          // Nhận diện tự động nếu cắm Sony / Webcam USB
          const externalCam = videoDevices.find(device => {
            const label = device.label.toLowerCase();
            return label.includes("sony") || 
                   label.includes("imaging edge") || 
                   label.includes("usb streaming") || 
                   label.includes("usb video") || 
                   label.includes("webcam");
          });
  
          if (externalCam) {
            setSelectedDevice(externalCam.deviceId);
            startCamera(externalCam.deviceId, true);
          } else if (videoDevices.length > 0) {
            // Nếu dùng trên điện thoại, ưu tiên tìm camera sau (back/environment)
            const mobileCam = videoDevices.find(device => 
              device.label.toLowerCase().includes("back") || 
              device.label.toLowerCase().includes("sau") ||
              device.label.toLowerCase().includes("environment")
            );
            const camToUse = mobileCam || videoDevices[videoDevices.length - 1];
            setSelectedDevice(camToUse.deviceId);
            startCamera(camToUse.deviceId, true);
          }
        }
        tempStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Lỗi tự động quét camera:", error);
      }
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    handleDeviceChange(); // Quét ngay lần đầu truy cập

    return () => navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Bổ sung tham số parents: ["root"] để thư mục hiện ngay ở ngoài My Drive
      const metadata = { name: folderName, mimeType: "application/vnd.google-apps.folder", parents: ["root"] };
      const res = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });
      const data = await res.json();

      // Bắt lỗi từ Google API (VD: hết dung lượng, lỗi token...)
      if (!res.ok) {
        console.error("Lỗi tạo thư mục từ Google API:", data);
        alert("Lỗi khi tạo thư mục trên Drive: " + (data.error?.message || "Lỗi không xác định"));
        return;
      }

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

      // Kiểm tra xem upload ảnh có thành công không
      if (!uploadRes.ok) {
        console.error("Lỗi API upload ảnh:", fileData);
        return null;
      }

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
  const startCamera = async (deviceIdToStart) => {
    const id = deviceIdToStart || selectedDevice;
    if (!id) return;

    setIsCameraLoading(true);

    // Tắt luồng camera hiện tại (nếu có) trước khi bật camera mới để giải phóng phần cứng
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          deviceId: { exact: id }, // Bắt buộc dùng exact để đổi chính xác sang thiết bị mới
          width: { ideal: 1920 }, // Ưu tiên yêu cầu độ phân giải ngang
          height: { ideal: 1080 }
        } 
      });
      setStream(s);
      localStorage.setItem("selectedCameraId", id); // GHI NHỚ MÁY ẢNH VÀO BỘ NHỚ!
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Lỗi truy cập camera:", err);
    } finally {
      setIsCameraLoading(false);
    }
  };

  const generateCollage = async (images, currentSettings) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const layout = currentSettings.layout || "vertical-3";

    // --- BẢNG CẤU HÌNH TỌA ĐỘ ẢNH CHUẨN ĐỂ THIẾT KẾ TRÊN CANVA ---
    // Bạn hãy chỉnh sửa các con số dx (tọa độ X), dy (tọa độ Y), dw (chiều rộng), dh (chiều cao) 
    // để khớp chính xác với thiết kế của bạn trên Canva.
    const layoutConfigs = {
      "single": {
        width: 1800, height: 1200,
        boxes: [ { dx: 150, dy: 100, dw: 1500, dh: 1000 } ]
      },
      "vertical-2": {
        width: 1200, height: 1800,
        boxes: [
          { dx: 75, dy: 133, dw: 1050, dh: 700 },
          { dx: 75, dy: 966, dw: 1050, dh: 700 }
        ]
      },
      "vertical-3": {
        width: 1200, height: 1800, // Đảm bảo kích thước này bằng đúng kích thước gốc file PNG của bạn
        boxes: [
          { dx: 180, dy: 30, dw: 840, dh: 560 },
          { dx: 180, dy: 620, dw: 840, dh: 560 },
          { dx: 180, dy: 1210, dw: 840, dh: 560 }
        ]
      },
      "grid-4": {
        width: 1800, height: 1200,
        boxes: [
          { dx: 66, dy: 44, dw: 800, dh: 533 }, { dx: 934, dy: 44, dw: 800, dh: 533 },
          { dx: 66, dy: 623, dw: 800, dh: 533 }, { dx: 934, dy: 623, dw: 800, dh: 533 }
        ]
      },
      "grid-6": {
        width: 1200, height: 1800,
        boxes: [
          { dx: 66, dy: 200, dw: 500, dh: 333 }, { dx: 634, dy: 200, dw: 500, dh: 333 },
          { dx: 66, dy: 650, dw: 500, dh: 333 }, { dx: 634, dy: 650, dw: 500, dh: 333 },
          { dx: 66, dy: 1100, dw: 500, dh: 333 }, { dx: 634, dy: 1100, dw: 500, dh: 333 }
        ]
      },
      "grid-8": {
        width: 1200, height: 1800,
        boxes: [
          { dx: 60, dy: 88, dw: 510, dh: 340 }, { dx: 630, dy: 88, dw: 510, dh: 340 },
          { dx: 60, dy: 516, dw: 510, dh: 340 }, { dx: 630, dy: 516, dw: 510, dh: 340 },
          { dx: 60, dy: 944, dw: 510, dh: 340 }, { dx: 630, dy: 944, dw: 510, dh: 340 },
          { dx: 60, dy: 1372, dw: 510, dh: 340 }, { dx: 630, dy: 1372, dw: 510, dh: 340 }
        ]
      }
    };

    const config = layoutConfigs[layout] || layoutConfigs["vertical-3"];
    canvas.width = config.width;
    canvas.height = config.height;

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

    // --- BƯỚC 1: VẼ HÌNH ẢNH CHỤP LÊN THEO TỌA ĐỘ Ở TRÊN ---
    loadedImages.forEach((img, index) => {
      const box = config.boxes[index];
      if (!box) return; // Tránh lỗi nếu số ảnh chụp lớn hơn số ô thiết kế

      // Áp dụng filter trước khi vẽ từng ảnh nếu có
      if (currentSettings.filter && currentSettings.filter !== "none") {
        ctx.filter = currentSettings.filter;
      } else {
        ctx.filter = "none";
      }
      ctx.drawImage(img, box.dx, box.dy, box.dw, box.dh);
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

      // Xử lý cắt ảnh (Crop) chuẩn xác như object-fit: cover để không bị méo khi chụp trên điện thoại
      const videoRatio = video.videoWidth / video.videoHeight;
      const canvasRatio = PHOTO_WIDTH / PHOTO_HEIGHT;
      let drawWidth = PHOTO_WIDTH;
      let drawHeight = PHOTO_HEIGHT;
      let offsetX = 0;
      let offsetY = 0;

      if (videoRatio > canvasRatio) {
        drawWidth = PHOTO_HEIGHT * videoRatio;
        offsetX = (PHOTO_WIDTH - drawWidth) / 2;
      } else {
        drawHeight = PHOTO_WIDTH / videoRatio;
        offsetY = (PHOTO_HEIGHT - drawHeight) / 2;
      }

      // Lật ngược ảnh ngang (Mirror) trước khi vẽ để giống hệt giao diện xem trước (như soi gương)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
      
      // Trả lại trạng thái mặc định của canvas để không làm hỏng thiết lập sau này
      ctx.setTransform(1, 0, 0, 1, 0, 0);

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
    <div className="booth-container" style={{ minHeight: "100vh", backgroundColor: isMobile ? "#111827" : "#f9fafb", display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "10px" : "20px", fontFamily: "'Inter', sans-serif" }}>
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
          font-size: ${isMobile ? '20px' : '32px'};
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
        @keyframes spinLoading {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .filter-sidebar::-webkit-scrollbar {
          width: ${isMobile ? '0px' : '6px'};
          height: ${isMobile ? '0px' : 'auto'};
          display: ${isMobile ? 'none' : 'block'};
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

        /* --- Tùy chỉnh thanh cuộn cho các Modal trên thiết bị di động --- */
        .custom-scrollbar {
          -webkit-overflow-scrolling: touch;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
          display: block !important; /* Ép hiển thị trên Mobile */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 8px;
        }
      `}</style>
      
      <AppHeader 
        isMobile={isMobile} 
        navigate={navigate} 
        onLogout={() => {
          localStorage.removeItem("token"); localStorage.removeItem("userRole"); localStorage.removeItem("userName");
          navigate("/");
        }}
      />

      {/* --- PHÂN NHÁNH GIAO DIỆN MÁY TÍNH / ĐIỆN THOẠI --- */}
      {isMobile ? (
        /* --- 📱 GIAO DIỆN MOBILE TÙY CHỈNH MỚI TẠO --- */
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "15px", flex: 1 }}>
          {/* Video Preview Mobile */}
          <div className="video-wrapper" style={{ width: "100%", aspectRatio: `${PHOTO_WIDTH} / ${PHOTO_HEIGHT}`, backgroundColor: "#1f2937", border: "4px solid #374151", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
            {stream && <div className="live-badge">LIVE</div>}
            
            {!stream && !isCameraLoading && (
              <div style={{ position: "absolute", textAlign: "center", color: "#9ca3af", zIndex: 5 }}>
                <div style={{ fontSize: "40px", marginBottom: "5px" }}>📷</div>
                <h3 style={{ margin: 0, fontSize: "16px" }}>Chưa có Camera</h3>
              </div>
            )}

            {isCameraLoading && (
              <div style={{ position: "absolute", textAlign: "center", color: "#60a5fa", zIndex: 5 }}>
                <div style={{ fontSize: "40px", marginBottom: "10px", animation: "spinLoading 1.5s ease-in-out infinite" }}>⏳</div>
                <h3 style={{ margin: 0, fontSize: "16px" }}>Đang kết nối...</h3>
              </div>
            )}
            <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", filter: settings.filter, display: stream ? "block" : "none", objectFit: "cover", opacity: isCameraLoading ? 0.3 : 1, transition: "opacity 0.3s" }} />
            
            {isCapturing && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.8)", color: "white", padding: "12px 20px", borderRadius: "20px", fontSize: "18px", fontWeight: "bold", zIndex: 20 }}>📸 Đang chụp...</div>}
            {currentPhotoIndex !== null && <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", color: "white", padding: "6px 12px", borderRadius: "15px", fontSize: "12px", fontWeight: "bold", zIndex: 10 }}>Chụp: {currentPhotoIndex} {typeof currentPhotoIndex === 'number' ? `/ ${settings.photoCount}` : ''}</div>}
            {countdownValue !== null && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "60px", color: "white", textShadow: "0 2px 10px rgba(0,0,0,0.5)", fontWeight: "900", zIndex: 10 }}>{countdownValue}</div>}
            {intervalValue !== null && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "60px", color: "white", textShadow: "0 2px 10px rgba(0,0,0,0.5)", fontWeight: "900", zIndex: 10 }}>{intervalValue}</div>}
          </div>

          {/* Danh sách Filters Cuộn Ngang */}
          <FilterSelector settings={settings} setSettings={setSettings} isMobile={true} />

          {/* Hệ thống Nút điều khiển dạng Lưới (Grid) */}
          <MobileControls 
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenLayout={() => setShowLayoutModal(true)}
            onOpenFrame={() => setShowFrameModal(true)}
            onOpenGallery={() => setShowGalleryModal(true)}
          />

          {/* Nút xem QR (Thu gọn thành Button thay vì trôi nổi chiếm diện tích trên màn hình bé) */}
          <MobileQrButton settings={settings} driveFolders={driveFolders} showSelectedFolderQr={showSelectedFolderQr} />

          {/* Nút bấm Chụp ảnh Khổng lồ */}
          {stream && (
            <div style={{ marginTop: "auto", paddingTop: "10px", paddingBottom: "20px" }}>
              <CaptureActionButtons isMobile={true} isSessionActive={isSessionActive} captureWithSettings={captureWithSettings} cancelSession={cancelSession} settings={settings} currentSessionPhotos={currentSessionPhotos} />
            </div>
          )}
        </div>
      ) : (
        /* --- 💻 GIAO DIỆN DESKTOP (MÁY TÍNH) GIỮ NGUYÊN BẢN CŨ --- */
        <div className="main-card">
        
        {/* Mã QR Album hiển thị cố định trên màn hình */}
        <FloatingQR settings={settings} driveFolders={driveFolders} />

        <div className="camera-mode" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <DesktopControls 
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenLayout={() => setShowLayoutModal(true)}
            onOpenFrame={() => setShowFrameModal(true)}
            onOpenGallery={() => setShowGalleryModal(true)}
          />

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px", alignItems: "stretch", width: "100%" }}>

            {/* --- Video Preview --- */}
            <div className="video-wrapper" style={{ width: `${PHOTO_WIDTH}px`, height: `${PHOTO_HEIGHT}px`, backgroundColor: "#e5e7eb", display: "flex", justifyContent: "center", alignItems: "center" }}>
              {stream && <div className="live-badge">LIVE</div>}
              
              {!stream && !isCameraLoading && (
                <div style={{ position: "absolute", textAlign: "center", color: "#6b7280", zIndex: 5, padding: "20px" }}>
                  <div style={{ fontSize: "60px", marginBottom: "15px" }}>📷</div>
                  <h3 style={{ margin: 0, fontSize: "24px", color: "#374151" }}>Chưa có Camera</h3>
                  <p style={{ margin: "10px 0 0 0", fontSize: "16px" }}>Vui lòng chọn Camera trong phần <strong>⚙️ Cài đặt</strong></p>
                </div>
              )}

              {isCameraLoading && (
                <div style={{ position: "absolute", textAlign: "center", color: "#4f46e5", zIndex: 5, padding: "20px" }}>
                  <div style={{ fontSize: "60px", marginBottom: "15px", animation: "spinLoading 1.5s ease-in-out infinite" }}>⏳</div>
                  <h3 style={{ margin: 0, fontSize: "24px", color: "#374151" }}>Đang kết nối Camera...</h3>
                </div>
              )}

              <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", filter: settings.filter, display: stream ? "block" : "none", objectFit: "cover", opacity: isCameraLoading ? 0.3 : 1, transition: "opacity 0.3s" }} />

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
            <FilterSelector settings={settings} setSettings={setSettings} isMobile={false} maxHeight={`${PHOTO_HEIGHT}px`} />

          </div>

          {stream && (
            <div className="booth-footer" style={{ display: "flex", justifyContent: "center", marginTop: "40px", gap: "15px" }}>
              <CaptureActionButtons isMobile={false} isSessionActive={isSessionActive} captureWithSettings={captureWithSettings} cancelSession={cancelSession} settings={settings} currentSessionPhotos={currentSessionPhotos} />
            </div>
          )}
        </div>
      </div>
      )}

      {/* Các Modals đã được tách ra file riêng để code gọn gàng */}
      <SettingsModal show={showSettingsModal} onClose={() => setShowSettingsModal(false)} devices={devices} selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice} startCamera={startCamera} previewVideoRef={previewVideoRef} stream={stream} settings={settings} setSettings={setSettings} selectDirectory={selectDirectory} directoryHandle={directoryHandle} accessToken={accessToken} driveFolders={driveFolders} createDriveFolder={createDriveFolder} showFolderQr={showSelectedFolderQr} onOpenDrivePicker={() => setShowDrivePickerModal(true)} />
      <DrivePickerModal show={showDrivePickerModal} onClose={() => setShowDrivePickerModal(false)} driveFolders={driveFolders} onSelectFolder={(id) => setSettings({ ...settings, driveFolderId: id })} onCreateFolder={createDriveFolder} selectedFolderId={settings.driveFolderId} />
      <LayoutModal show={showLayoutModal} onClose={() => setShowLayoutModal(false)} settings={settings} setSettings={setSettings} />
      <FrameModal show={showFrameModal} onClose={() => setShowFrameModal(false)} settings={settings} setSettings={setSettings} sampleFrames={sampleFrames} onRefreshFrames={fetchCustomFrames} />
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
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PhotoboothMain />
    </Router>
  );
}

export default App;
