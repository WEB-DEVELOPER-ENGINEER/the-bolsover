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

  const renderImageField = (label: string, field: string, description: string) => (
    <div className="p-4 rounded border border-white/10 bg-black/40 space-y-3">
      <label className="block text-xs uppercase tracking-widest text-luxury-brass font-mono">
        {label}
      </label>
      <p className="text-neutral-400 text-xs font-light">{description}</p>

      <div className="space-y-2 pt-1">
        <input
          type="text"
          value={(configForm as any)[field] || ""}
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
            <span>{uploadingField === field ? "Uploading..." : "Upload Image"}</span>
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
              <span>Uploading {uploadingInfo.name} ({uploadingInfo.sizeMb} MB)...</span>
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

  if (!configForm) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-white font-light">
            Home Page Pictures
          </h2>
          <p className="text-neutral-400 text-sm font-light mt-1">
            Update the hero poster, editorial, and film section images for the home page.
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

      <div className="bg-luxury-black/80 border border-white/10 p-6 rounded space-y-6">
        <h3 className="text-xs uppercase tracking-ultra text-luxury-brass font-mono border-b border-white/10 pb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>1. Hero & Film Section</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderImageField("Hero Video Poster", "homeHeroPoster", "Image displayed before the video plays.")}
          {renderImageField("Film Background Image", "filmMainImage", "Main background building image behind the film quotes.")}
        </div>
      </div>

      <div className="bg-luxury-black/80 border border-white/10 p-6 rounded space-y-6">
        <h3 className="text-xs uppercase tracking-ultra text-luxury-brass font-mono border-b border-white/10 pb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>2. Editorial Sections</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderImageField("Architecture Image", "architectureImage", "Image for 'A quietly confident London address'.")}
          {renderImageField("Apartments Teaser Image", "apartmentsTeaserImage", "Image for 'Homes for everyday London life'.")}
        </div>
      </div>
    </form>
  );
};
