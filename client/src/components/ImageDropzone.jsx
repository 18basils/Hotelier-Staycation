import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Check, Loader2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ImageDropzone({ value, onChange, label = "Property Photo" }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5 MB');
      return;
    }

    setUploading(true);
    try {
      // 1. Try server-side upload with Multer
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        toast.success('Image uploaded successfully!');
      } else {
        // Fallback to client-side data URI conversion
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          onChange(uploadEvent.target.result);
          toast.success('Image loaded successfully');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      // Fallback to client-side data URI conversion
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        onChange(uploadEvent.target.result);
        toast.success('Image loaded successfully');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUrlApply = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <label>{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
        >
          <LinkIcon size={12} />
          <span>{showUrlInput ? 'Switch to File Drag & Drop' : 'Or paste web URL'}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={urlDraft || value}
            onChange={(e) => setUrlDraft(e.target.value)}
            className="flex-1 p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="py-2 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
          >
            Apply
          </button>
        </div>
      ) : value ? (
        /* Preview with Replace/Remove options */
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 h-44 bg-slate-100 dark:bg-slate-800 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-3 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 shadow flex items-center gap-1"
            >
              <Upload size={13} />
              <span>Replace Photo</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="py-1.5 px-3 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow flex items-center gap-1"
            >
              <X size={13} />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* Drag-and-Drop Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/60 bg-slate-50/60 dark:bg-slate-800/40'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <Loader2 size={28} className="animate-spin text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Processing & uploading image...</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Upload size={18} />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Drag & drop property image here, or <span className="text-emerald-600 dark:text-emerald-400 underline">browse</span>
              </p>
              <p className="text-[11px] text-slate-400">
                PNG, JPG, WebP up to 5 MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
