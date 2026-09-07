"use client";

import React, { useState, useEffect } from "react";
import { Upload, Save, Check, AlertCircle, ImageIcon, Loader2 } from "lucide-react";
import { useCMS } from "@/context/CMSContext";

export const HomeImagesEditor: React.FC = () => {
  const { data, updateCMSData, uploadFile } = useCMS();
  const [configForm, setConfigForm] = useState(data.bolsoverConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (data.bolsoverConfig) {
      setConfigForm(data.bolsoverConfig);
    }
  }, [data.bolsoverConfig]);

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadingInfo, setUploadingInfo] = useState<{ name: string; sizeMb: string } | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<{ field: string; text: string; isError?: boolean } | null>(null);

  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({});

  const handleConfigChange = (field: string, val: string) => {
    setConfigForm((prev: any) => ({
      ...prev,
      [field]: val
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

      setUploadingField(targetField);
      setUploadingInfo({ name: file.name, sizeMb });
      setUploadStatusMsg(null);

      const uploaded = await uploadFile(file);

      setUploadingField(null);
      setUploadingInfo(null);

      if (uploaded && uploaded.url) {
        handleConfigChange(targetField, uploaded.url);
        setUploadStatusMsg({ field: targetField, text: `Successfully uploaded ${file.name} (${sizeMb} MB)! Click "Save Changes".` });
        setTimeout(() => setUploadStatusMsg(null), 5000);
      } else {
        setUploadStatusMsg({ field: targetField, text: `Failed to upload ${file.name}. Please try again.`, isError: true });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await updateCMSData({
      bolsoverConfig: configForm,
    });
    setIsSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const renderImageField = (label: string, field: string, description: string, badge?: string) => {
    const currentVal = (configForm as any)[field] || "";
    const dims = imageDimensions[field];
    return (
      <div className="p-4 rounded border border-white/10 bg-black/40 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs uppercase tracking-widest text-luxury-brass font-mono">
            {label}
          </label>
          {badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-luxury-brass/10 border border-luxury-brass/30 text-luxury-brass">
              {badge}
            </span>
          )}
        </div>
        <p className="text-neutral-400 text-xs font-light">{description}</p>

        {/* Live Image Preview Thumbnail with Dimension Readout */}
        {currentVal && (
          <div className="space-y-2">
            <div className="relative w-full h-36 bg-neutral-950 border border-white/10 rounded overflow-hidden flex items-center justify-center p-1">
              <img
                src={currentVal}
                alt={label}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setImageDimensions((prev) => ({
                    ...prev,
                    [field]: { width: img.naturalWidth, height: img.naturalHeight }
                  }));
                }}
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute bottom-1 right-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-neutral-300">
                Live Preview
              </div>
            </div>

            {dims && (
              <div className={`flex items-center justify-between px-2.5 py-1 rounded text-[10px] font-mono border ${
                dims.width >= 1920
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : dims.width >= 1200
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}>
                <span>{dims.width} × {dims.height} px</span>
                <span>
                  {dims.width >= 1920
                    ? "✓ Full-Bleed Crisp"
                    : dims.width >= 1200
                    ? "Good (1920px+ ideal)"
                    : "Low Res (Blur risk on full screen)"}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 pt-1">
          <input
            type="text"
            value={currentVal}
            onChange={(e) => handleConfigChange(field, e.target.value)}
            placeholder="https://..."
            className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-luxury-brass"
          />

          <div className="flex flex-col gap-2">
            <label className={`btn-luxury-ghost cursor-pointer inline-flex items-center gap-2 text-xs ${uploadingField === field ? "opacity-50 pointer-events-none" : ""}`}>
              {uploadingField === field ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-brass" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploadingField === field ? "Uploading to Supabase..." : "Upload Image to Supabase"}</span>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingField === field}
                onChange={(e) => handleFileUpload(e, field)}
                className="hidden"
              />
            </label>

            {uploadingField === field && uploadingInfo && (
              <div className="flex items-center gap-2 text-xs text-luxury-brass bg-luxury-brass/10 px-3 py-2 rounded border border-luxury-brass/30 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-brass shrink-0" />
                <span>Uploading {uploadingInfo.name} ({uploadingInfo.sizeMb} MB) to Supabase Storage...</span>
              </div>
            )}

            {uploadStatusMsg && uploadStatusMsg.field === field && (
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded border ${uploadStatusMsg.isError ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
                {uploadStatusMsg.isError ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <Check className="w-3.5 h-3.5 shrink-0" />}
                <span>{uploadStatusMsg.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!configForm) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-white font-light">
            Home Page Pictures
          </h2>
          <p className="text-neutral-400 text-sm font-light mt-1">
            Update the sticky scroll story cards, editorial photos, and hero video poster for the homepage.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="btn-luxury inline-flex items-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </>
          )}
        </button>
      </div>

      {/* Sticky Scroll Story Section (3 Cards) */}
      <div className="bg-luxury-black/80 border border-white/10 p-6 rounded space-y-6">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-ultra text-luxury-brass font-mono flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>Sticky Scroll Story Cards (Home Page)</span>
          </h3>
          <span className="text-[10px] font-mono text-neutral-400">3 Cards Section</span>
        </div>
        
        <p className="text-neutral-400 text-xs font-light">
          These 3 photos drive the 400svh sticky scroll animation on the homepage where cards overlap and transition into each other.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderImageField(
            "Card 1: Architecture", 
            "architectureImage", 
            "First card — 'Edwardian character, considered for contemporary life.'", 
            "Card 1"
          )}
          {renderImageField(
            "Card 2: Lifestyle / Street", 
            "filmMainImage", 
            "Second card — 'Life at The Bolsover: A quietly confident London address.'", 
            "Card 2"
          )}
          {renderImageField(
            "Card 3: Interior / Living", 
            "apartmentsTeaserImage", 
            "Third card — 'Inside The Bolsover: Homes for everyday London life.'", 
            "Card 3"
          )}
        </div>
      </div>

      {/* Hero Video Poster */}
      <div className="bg-luxury-black/80 border border-white/10 p-6 rounded space-y-6">
        <h3 className="text-xs uppercase tracking-ultra text-luxury-brass font-mono border-b border-white/10 pb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>Hero Video Poster</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderImageField(
            "Hero Video Poster", 
            "homeHeroPoster", 
            "Fallback / placeholder image displayed before the hero video starts playing."
          )}
        </div>
      </div>
    </form>
  );
};
