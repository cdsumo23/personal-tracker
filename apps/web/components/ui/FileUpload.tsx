import * as React from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_HOST = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

export interface FileUploadProps {
  onFileSelect: (file: File | undefined) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  error?: string;
  value?: File;
  previewUrl?: string;
  variant?: 'default' | 'avatar';
}

export function FileUpload({
  onFileSelect,
  accept = 'image/*,application/pdf',
  maxSizeMB = 10,
  label,
  error,
  value,
  previewUrl,
  variant = 'default',
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(previewUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getFullPreviewUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    return `${API_HOST}${url}`;
  };

  React.useEffect(() => {
    if (previewUrl) {
      setPreview(previewUrl);
    }
  }, [previewUrl]);

  React.useEffect(() => {
    if (!value) {
      if (!previewUrl) setPreview(null);
      return;
    }

    if (value.type.startsWith('image/')) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [value, previewUrl]);

  const handleFile = (file?: File) => {
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds the ${maxSizeMB}MB limit.`);
      return;
    }

    onFileSelect(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(undefined);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (variant === 'avatar') {
    return (
      <div className="flex flex-col items-center space-y-1.5 w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-350 select-none">
            {label}
          </label>
        )}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            'relative flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-full cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-200 border-slate-700 overflow-hidden group shadow-md',
            {
              'border-primary-500 bg-slate-800/80': isDragActive,
              'border-red-500/80': error,
            }
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={onInputChange}
            className="hidden"
          />

          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getFullPreviewUrl(preview) || undefined}
                alt="Avatar preview"
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-[10px] font-bold text-slate-200">
                <Upload className="w-4 h-4 mb-1" />
                Change
              </div>
              <button
                onClick={removeFile}
                type="button"
                className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/70 border border-slate-800 text-slate-350 hover:text-white transition-colors z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-2">
              <Upload className="w-5 h-5 mb-1 group-hover:text-primary-450 transition-colors" />
              <span className="text-[10px] font-bold">Upload</span>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'relative flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed rounded-2xl cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 transition-all duration-200 border-slate-700',
          {
            'border-primary-500 bg-slate-800/80': isDragActive,
            'border-red-500/80 focus:ring-red-500/50': error,
          }
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={onInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-[140px] flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getFullPreviewUrl(preview) || undefined}
              alt="Uploaded file preview"
              className="max-w-full max-h-full rounded-xl object-contain"
            />
            <button
              onClick={removeFile}
              type="button"
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : value ? (
          // Selected Non-image File (e.g. PDF)
          <div className="flex flex-col items-center p-4">
            <div className="relative mb-2">
              <FileText className="w-10 h-10 text-primary-400" />
              <CheckCircle2 className="absolute -bottom-1 -right-1 w-4 h-4 text-emerald-500 fill-slate-900" />
            </div>
            <p className="text-sm font-medium text-slate-200 max-w-[200px] truncate">
              {value.name}
            </p>
            <p className="text-xs text-slate-500">
              {(value.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <button
              onClick={removeFile}
              type="button"
              className="mt-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              Remove file
            </button>
          </div>
        ) : (
          // Default State
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-200">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPEG, PNG, PDF up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
