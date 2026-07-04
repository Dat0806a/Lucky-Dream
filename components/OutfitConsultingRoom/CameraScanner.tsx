import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Zap, Bot, Mic } from 'lucide-react';
import { motion } from 'motion/react';

interface CameraScannerProps {
  onCapture: (image: string) => void;
  isScanning: boolean;
  captureTrigger: number;
  cameraActive: boolean;
  onStatusChange?: (status: string) => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ 
  onCapture, 
  isScanning, 
  captureTrigger,
  cameraActive,
  onStatusChange
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (!cameraActive) return;
      try {
        setStreamError(null);
        if (onStatusChange) onStatusChange('Connecting...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          if (onStatusChange) onStatusChange('Connected');
        }
      } catch (err: any) {
        console.error('Error accessing camera:', err);
        setStreamError('Không thể mở camera. Vui lòng cấp quyền truy cập camera.');
        if (onStatusChange) onStatusChange('Failed');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (onStatusChange) onStatusChange('Disconnected');
    };
  }, [cameraActive]);

  useEffect(() => {
    if (captureTrigger > 0) {
      capture();
    }
  }, [captureTrigger]);

  const capture = () => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Mirror capture to match the mirrored live preview
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onCapture(dataUrl);
        }
      } catch (e) {
        console.error('Failed to capture frame:', e);
      }
    }
  };

  return (
    <div className="relative w-full aspect-video bg-slate-950 rounded-[1.5rem] overflow-hidden border border-red-100/30 dark:border-slate-800 flex items-center justify-center">
      {streamError ? (
        <div className="text-center p-6 space-y-3">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <Camera size={24} />
          </div>
          <p className="text-sm font-semibold text-red-400 max-w-sm">{streamError}</p>
        </div>
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
      )}
      
      {/* Scanning Laser Line */}
      {isScanning && !streamError && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
             className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent shadow-[0_0_15px_rgba(212,175,55,1)]"
             initial={{ top: "0%" }}
             animate={{ top: "100%" }}
             transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
           />
        </div>
      )}

      {/* Manual Quick Snap Button overlay */}
      {!streamError && (
        <button 
          onClick={capture} 
          title="Chụp ngay"
          className="absolute bottom-4 right-4 bg-white/95 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 text-slate-800 dark:text-white p-3.5 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 border border-red-100/50 dark:border-slate-800 flex items-center justify-center"
        >
          <Camera size={20} className="text-brand-red animate-pulse" />
        </button>
      )}
    </div>
  );
};
