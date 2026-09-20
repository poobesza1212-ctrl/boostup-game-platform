import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

export default function ImageUploader({ 
  currentImageUrl, 
  onImageUploaded, 
  label = "อัปโหลดรูปภาพจากเครื่อง",
  aspectRatio = "square" // 'square' | 'banner'
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || '');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, WEBP, GIF)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ขนาดไฟล์เกินกำหนด (สูงสุด 5MB)');
      return;
    }

    setError('');
    setIsUploading(true);

    // Read local file as Data URL
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      setPreview(base64Data);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            filename: file.name
          })
        });
        const data = await res.json();
        if (data.success) {
          setPreview(data.url);
          onImageUploaded(data.url);
        } else {
          setError(data.message || 'อัปโหลดไม่สำเร็จ');
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-300 block">{label}</label>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
          dragOver 
            ? 'border-red-500 bg-red-950/30' 
            : preview 
            ? 'border-zinc-700 bg-zinc-900/60' 
            : 'border-zinc-700 hover:border-red-500/80 bg-zinc-900/40 hover:bg-zinc-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-3">
            <div className={`relative mx-auto overflow-hidden rounded-xl border border-zinc-700 bg-black ${
              aspectRatio === 'banner' ? 'aspect-[21/9] max-w-sm' : 'w-24 h-24'
            }`}>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>อัปโหลดสำเร็จแล้ว คลิกเพื่อเปลี่ยนรูป</span>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 mx-auto flex items-center justify-center text-zinc-400">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">
              คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์รูปภาพมาวางที่นี่
            </div>
            <div className="text-[10px] text-zinc-500">
              รองรับ PNG, JPG, WEBP, GIF (ขนาดสูงสุด 5MB)
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
