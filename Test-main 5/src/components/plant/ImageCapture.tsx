import React, { useState, useEffect, useRef } from "react";
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageCaptureProps {
  onImageCapture?: (file: File) => void;
  isProcessing?: boolean;
  onClear?: () => void;
}

const ImageCapture = ({
  onImageCapture = () => {},
  isProcessing = false,
  onClear = () => {},
}: ImageCaptureProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      console.error("File is not an image");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    onImageCapture(file);
  };

  const clearImage = () => {
    setPreviewImage(null);
    onClear();
  };

  const startCamera = async () => {
    try {
      setCameraError(null);

      // First check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((device) => device.kind === "videoinput");

      if (!hasCamera) {
        throw new Error("No camera found on this device");
      }

      // Try to get the rear camera first, fall back to any camera
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e) {
        // If rear camera fails, try any camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);

        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().then(resolve);
              }
            };
          }
        });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError(
        "Could not access camera. Please ensure you've granted camera permissions.",
      );
      setIsCameraActive(false);
    }
  };

  // const capturePhoto = () => {
  //   if (!videoRef.current || !streamRef.current) return;

  //   const video = videoRef.current;
  //   const canvas = document.createElement("canvas");
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;

  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   // Draw the current video frame
  //   ctx.drawImage(video, 0, 0);

  //   // Convert to file
  //   canvas.toBlob(
  //     (blob) => {
  //       if (blob) {
  //         const file = new File([blob], "camera-photo.jpg", {
  //           type: "image/jpeg",
  //         });
  //         handleFile(file);
  //         stopCamera();
  //       }
  //     },
  //     "image/jpeg",
  //     0.9,
  //   );
  // };

  return (
    <Card className="w-full max-w-[800px] h-[500px] mx-auto bg-white p-6">
      <div
        className={`relative w-full h-full rounded-lg border-2 border-dashed
          ${dragActive ? "border-green-500 bg-green-50" : "border-gray-300"}
          ${isProcessing ? "pointer-events-none opacity-50" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isCameraActive ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              autoPlay
              playsInline
              muted
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              {/* <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={capturePhoto}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button> */}
              <Button variant="secondary" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        ) : previewImage ? (
          <div className="relative w-full h-full">
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
            />
            {!isProcessing && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="p-4 rounded-full bg-green-100">
              <Camera className="h-12 w-12 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                Capture or Upload Plant Photo
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Drag and drop, paste, or upload an image
              </p>
              {cameraError && (
                <p className="text-sm text-red-500 mt-2">{cameraError}</p>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              {/* <Button
                variant="outline"
                onClick={startCamera}
                disabled={isCameraActive}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button> */}
            </div>
          </div>
        )}
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileInput}
        />
      </div>
    </Card>
  );
};

export default ImageCapture;

