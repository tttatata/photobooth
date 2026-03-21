
import { useState, useRef, useEffect } from "react";

export default function usePhotobooth() {
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

  const [countdownValue, setCountdownValue] = useState(null);
  const [intervalValue, setIntervalValue] = useState(null);

  // Liệt kê camera
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
    });
  }, []);

  async function clgcapturePhoto() {
    // logic chụp và lưu ảnh
    console.log("Ảnh đã chụp và lưu!");
    console.log(stream);
  }

  const PHOTO_WIDTH = 600;
  const PHOTO_HEIGHT = 400;

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      canvas.width = PHOTO_WIDTH;
      canvas.height = PHOTO_HEIGHT;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT); // Vẽ khung hình từ video lên canvas

      const dataUrl = canvas.toDataURL("image/png");
      setPhotos((prev) => [...prev, dataUrl]);
    }
  };

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
    
    // thông báo ảnh đã chụp
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

  // Chọn ảnh
  const toggleSelect = (index) => {
    if (selectedPhotos.includes(index)) {
      setSelectedPhotos((prev) => prev.filter((i) => i !== index));
    } else {
      setSelectedPhotos((prev) => [...prev, index]);
    }
  };

  const printPhoto = (photo) => {
    setPhotoToPrint(photo);       // ảnh được chọn từ gallery
    setShowPrintModal(true);      // mở modal
  };

  return {
    showPrintModal, setShowPrintModal, photoToPrint, setPhotoToPrint,
    devices, selectedDevice, setSelectedDevice, photos, selectedPhotos,
    settings, setSettings, videoRef, canvasRef, countdownValue, intervalValue,
    startCamera, captureWithSettings, toggleSelect, printPhoto, PHOTO_WIDTH, PHOTO_HEIGHT
  };
}