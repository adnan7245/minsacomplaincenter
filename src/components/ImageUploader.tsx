import React, { useRef, useState } from 'react';
import { UploadCloud, X, CheckCircle2, Image as ImageIcon, Eye, AlertCircle } from 'lucide-react';
import { ProductImageState } from '../types';

interface ImageUploaderProps {
  id: string;
  label: string;
  helpText: string;
  value: ProductImageState;
  onChange: (imageState: ProductImageState) => void;
  error?: string;
  required?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  id,
  label,
  helpText,
  value,
  onChange,
  error,
  required = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      onChange({
        file: null,
        dataUrl: null,
        fileName: file.name,
        fileSize: file.size,
        error: 'Please upload a valid JPG, JPEG, or PNG image file.',
      });
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onChange({
        file: null,
        dataUrl: null,
        fileName: file.name,
        fileSize: file.size,
        error: 'File size exceeds 10MB. Please upload a smaller image.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        file,
        dataUrl: reader.result as string,
        fileName: file.name,
        fileSize: file.size,
        error: null,
      });
    };
    reader.onerror = () => {
      onChange({
        file: null,
        dataUrl: null,
        fileName: file.name,
        fileSize: file.size,
        error: 'Failed to read image file. Please try again.',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange({
      file: null,
      dataUrl: null,
      fileName: null,
      fileSize: null,
      error: null,
    });
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const currentError = error || value.error;

  return (
    <div className="space-y-2" id={`container-${id}`}>
      <div className="flex justify-between items-baseline">
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-[#a67c52]">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        <span className="text-[11px] text-[#8d7b6d]">JPG, JPEG, PNG only</span>
      </div>

      <p className="text-xs text-[#8d7b6d] leading-normal">{helpText}</p>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Upload Box or Image Preview Card */}
      {!value.dataUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 group ${
            currentError
              ? 'border-rose-400 bg-rose-50/50 hover:bg-rose-50'
              : isDragging
              ? 'border-[#a67c52] bg-[#f4ece4] shadow-inner'
              : 'border-[#e5dcd3] bg-[#faf9f8] hover:bg-[#f4ece4]/50 hover:border-[#a67c52]'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                currentError
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-[#eee3d8] text-[#6d4c41]'
              }`}
            >
              <UploadCloud className="w-5 h-5" />
            </div>

            <div className="text-xs sm:text-sm">
              <span className="font-bold text-[#a67c52] hover:underline">
                Choose File / Upload Picture
              </span>{' '}
              <span className="text-[#8d7b6d]">or drag and drop</span>
            </div>

            <p className="text-[11px] text-[#8d7b6d] italic">Clear picture of the product design recommended</p>
          </div>
        </div>
      ) : (
        /* Selected Image Preview Box */
        <div className="relative border border-[#eee3d8] bg-[#faf9f8] rounded-xl p-3 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={() => setIsPreviewOpen(true)}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#e5dcd3] bg-white shrink-0 group cursor-pointer"
            >
              <img
                src={value.dataUrl}
                alt={label}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Eye className="w-4 h-4" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6d4c41]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Image Attached Successfully</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#4a423d] truncate mt-0.5">
                {value.fileName || 'product-image.jpg'}
              </p>
              <p className="text-xs text-[#8d7b6d]">{formatSize(value.fileSize)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="p-1.5 text-[#8d7b6d] hover:text-[#4a423d] hover:bg-[#eee3d8]/60 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="View full image"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-100/80 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Remove image"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {currentError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{currentError}</span>
        </div>
      )}

      {/* Fullscreen Preview Lightbox Modal */}
      {isPreviewOpen && value.dataUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700">{label}</span>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={value.dataUrl}
                alt={label}
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
