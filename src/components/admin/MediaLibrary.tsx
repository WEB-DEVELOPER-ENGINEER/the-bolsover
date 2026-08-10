"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Image as ImageIcon, Video, Trash2, Copy, Check, Search, Filter, AlertCircle, FileCheck } from "lucide-react";
import { useCMS, MediaAsset } from "@/context/CMSContext";

export const MediaLibrary: React.FC = () => {
  const { mediaAssets, uploadFile, deleteFile } = useCMS();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = async (files: FileList | File[]) => {
    setErrorMsg(null);
    setIsUploading(true);
    setUploadProgress(20);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(Math.round(((i + 1) / files.length) * 80) + 15);
      const uploaded = await uploadFile(file);
      if (!uploaded) {
        setErrorMsg(`Failed to upload ${file.name}. Please check file format and size limits.`);
      }
    }

    setUploadProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const filteredAssets = mediaAssets.filter((asset) => {
    const matchesFilter = filterCategory === "all" || asset.category === filterCategory;
    const matchesSearch = asset.originalName.toLowerCase().includes(searchQuery.toLowerCase()) || asset.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-white font-light">
            Media Asset Vault
          </h2>
          <p className="text-neutral-400 text-sm font-light mt-1">
            Drag and drop images, MP4 videos, and PDF brochures to store and use across the site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="btn-luxury inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-luxury-brass bg-luxury-brass/10 scale-[1.01]"
            : "border-white/15 hover:border-luxury-brass/50 bg-black/40 hover:bg-black/60"
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full glass-panel border border-white/20 flex items-center justify-center text-luxury-brass shadow-2xl">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-white font-medium text-base">
              Drag & Drop high-res files here, or <span className="text-luxury-brass underline">browse computer</span>
            </p>
            <p className="text-neutral-400 text-xs mt-1">
              Supports PNG, JPG, WEBP, SVG, MP4, WEBM, and PDF brochures (Max 100MB per file)
            </p>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-lg flex flex-col items-center justify-center p-6 space-y-3 z-30">
            <div className="w-12 h-12 rounded-full border-2 border-luxury-brass border-t-transparent animate-spin" />
            <p className="text-luxury-cream text-sm font-medium uppercase tracking-wider">
              Uploading & Processing Asset... {uploadProgress}%
            </p>
            <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-luxury-brass transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded border border-red-500/30 bg-red-950/40 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-luxury-black/80 p-4 border border-white/10 rounded">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: "all", label: "All Assets", icon: Filter },
            { id: "image", label: "Images", icon: ImageIcon },
            { id: "video", label: "Videos", icon: Video },
            { id: "document", label: "Documents", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filterCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-luxury-brass text-black font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/15 rounded pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-luxury-brass"
          />
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredAssets.map((asset, idx) => (
          <div
            key={asset.filename || idx}
            className="group relative bg-black/80 border border-white/10 rounded overflow-hidden flex flex-col justify-between hover:border-luxury-brass/60 transition-all shadow-xl"
          >
            {/* Thumbnail Preview */}
            <div className="relative aspect-square overflow-hidden bg-neutral-900 flex items-center justify-center">
              {asset.category === "image" ? (
                <img
                  src={asset.url}
                  alt={asset.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : asset.category === "video" ? (
                <video
                  src={asset.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-neutral-400 space-y-2">
                  <FileText className="w-10 h-10 text-luxury-brass" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-center truncate max-w-full">
                    PDF Brochure
                  </span>
                </div>
              )}

              {/* Format Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-luxury-brass uppercase border border-white/10">
                {asset.category}
              </div>
            </div>

            {/* File Info Footer */}
            <div className="p-3 space-y-2 bg-luxury-black border-t border-white/10">
              <p className="text-xs text-white truncate font-medium" title={asset.originalName}>
                {asset.originalName}
              </p>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                <button
                  onClick={() => copyToClipboard(asset.url)}
                  type="button"
                  className="flex-1 py-1 px-2 rounded border border-white/10 hover:border-luxury-brass/40 text-[10px] font-mono uppercase text-neutral-300 hover:text-white flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedUrl === asset.url ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-luxury-brass" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => deleteFile(asset.filename || asset.url)}
                  type="button"
                  className="p-1 rounded border border-white/10 hover:border-red-500/50 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 transition-colors"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-500 space-y-3 bg-black/30 border border-white/5 rounded">
            <FileCheck className="w-10 h-10 mx-auto text-neutral-600" />
            <p className="text-sm font-light">No media assets found matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
