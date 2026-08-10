"use client";

import React, { useState, useEffect } from "react";
import { Upload, Save, Film, FileText, Check, AlertCircle, Video, Play, Loader2 } from "lucide-react";
import { useCMS } from "@/context/CMSContext";

export const HeroFilmEditor: React.FC = () => {
  const { data, updateCMSData, uploadFile } = useCMS();
  const [heroForm, setHeroForm] = useState(data.heroData);
  const [configForm, setConfigForm] = useState(data.bolsoverConfig);
  const [introForm, setIntroForm] = useState(data.introData || {
    eyebrow: "The Bolsover",
    titleLine1: "A quietly confident",
    titleLine2: "London address.",
    description: "A limited collection of 24 studio to four-bedroom apartments, combining Edwardian character with contemporary comfort in Fitzrovia, London W1.",
    stat1Value: "24",
    stat1Label: "Private Apartments",
    stat2Value: "Studio – 4",
    stat2Label: "Bedrooms & Duplex",
    stat3Value: "W1",
    stat3Label: "Fitzrovia, London",
    image: "/assets/images/building.png",
    imageTag: "Edwardian Architecture",
    imageAddress: "3–8 Bolsover Street"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (data.heroData) {
      setHeroForm(data.heroData);
    }
    if (data.bolsoverConfig) {
      setConfigForm(data.bolsoverConfig);
    }
    if (data.introData) {
      setIntroForm(data.introData);
    }
  }, [data.heroData, data.bolsoverConfig, data.introData]);

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadingInfo, setUploadingInfo] = useState<{ name: string; sizeMb: string } | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<{ field: string; text: string; isError?: boolean } | null>(null);

  const handleHeroChange = (field: string, val: string) => {
    setHeroForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleIntroChange = (field: string, val: string) => {
    setIntroForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleConfigChange = (field: string, val: string) => {
    setConfigForm((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  const handleFilmChange = (field: string, val: string) => {
    setConfigForm((prev) => ({
      ...prev,
      film: {
        ...prev.film,
        [field]: val
      }
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: "teaserSrc" | "fullSrc" | "brochurePath" | "floorPlansPdfPath" | "introImage") => {
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
        if (targetField === "brochurePath") {
          handleConfigChange("brochurePath", uploaded.url);
        } else if (targetField === "floorPlansPdfPath") {
          handleConfigChange("floorPlansPdfPath", uploaded.url);
        } else if (targetField === "introImage") {
          handleIntroChange("image", uploaded.url);
        } else {
          handleFilmChange(targetField, uploaded.url);
        }
        setUploadStatusMsg({ field: targetField, text: `Successfully uploaded ${file.name} (${sizeMb} MB)! Click "Save Changes" to publish live.` });
        setTimeout(() => setUploadStatusMsg(null), 5000);
      } else {
        setUploadStatusMsg({ field: targetField, text: `Failed to upload ${file.name}. Please try again or paste a URL directly.`, isError: true });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await updateCMSData({
      heroData: heroForm,
      bolsoverConfig: configForm,
      introData: introForm
    });
    setIsSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-white font-light">
            Hero & Intro Manager
          </h2>
          <p className="text-neutral-400 text-sm font-light mt-1">
            Update cinematic video assets, header copy, project intro section, and brochure files.
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
      {/* Hero Content Section */}
      <div className="bg-luxury-black/80 border border-white/10 p-6 rounded space-y-6">
        <h3 className="text-xs uppercase tracking-ultra text-luxury-brass font-mono border-b border-white/10 pb-3 flex items-center gap-2">
          <Film className="w-4 h-4" />
          <span>1. Hero Section Headlines & Copy</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono mb-2">
              Eyebrow Tagline
            </label>
            <input
              type="text"
              value={heroForm.eyebrow}
              onChange={(e) => handleHeroChange("eyebrow", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-luxury-brass"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono mb-2">
              Main Title Line 1 (Italic)
            </label>
            <input
              type="text"
              value={heroForm.titleLine1}
              onChange={(e) => handleHeroChange("titleLine1", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-luxury-brass"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono mb-2">
              Main Title Line 2 (Bold)
            </label>
            <input
              type="text"
              value={heroForm.titleLine2}
              onChange={(e) => handleHeroChange("titleLine2", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-luxury-brass"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono mb-2">
              Introductory Copy Paragraph
            </label>
            <textarea
              rows={3}
              value={heroForm.introCopy}
              onChange={(e) => handleHeroChange("introCopy", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-luxury-brass"
            />
          </div>
        </div>
      </div>

      {/* Project Intro Section Editor */}
      <div className="bg-luxury-black/80 border border-white/10 p-6 rounded space-y-6">
        <h3 className="text-xs uppercase tracking-ultra text-luxury-brass font-mono border-b border-white/10 pb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>2. Project Intro Section</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono mb-1">
              Eyebrow Badge
            </label>
            <input
              type="text"
              value={introForm.eyebrow}
              onChange={(e) => handleIntroChange("eyebrow", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono mb-1">
              Headline Line 1
            </label>
            <input
              type="text"
              value={introForm.titleLine1}
              onChange={(e) => handleIntroChange("titleLine1", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono mb-1">
              Headline Line 2 (Italic Accent)
            </label>
            <input
              type="text"
              value={introForm.titleLine2}
              onChange={(e) => handleIntroChange("titleLine2", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono mb-1">
              Introductory Paragraph Description
            </label>
            <textarea
              rows={3}
              value={introForm.description}
              onChange={(e) => handleIntroChange("description", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-3 py-2 text-xs text-white"
            />
          </div>

          {/* Key Stats Cards */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-black/40 p-3 rounded border border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-mono text-luxury-brass">Stat Card 1</span>
              <input
                type="text"
                placeholder="Value (e.g. 24)"
                value={introForm.stat1Value}
                onChange={(e) => handleIntroChange("stat1Value", e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded px-2.5 py-1 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Label (e.g. Private Apartments)"
                value={introForm.stat1Label}
                onChange={(e) => handleIntroChange("stat1Label", e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded px-2.5 py-1 text-xs text-neutral-300"
              />
            </div>

            <div className="bg-black/40 p-3 rounded border border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-mono text-luxury-brass">Stat Card 2</span>
              <input
                type="text"
                placeholder="Value (e.g. Studio – 4)"
                value={introForm.stat2Value}
                onChange={(e) => handleIntroChange("stat2Value", e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded px-2.5 py-1 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Label (e.g. Bedrooms & Duplex)"
                value={introForm.stat2Label}
                onChange={(e) => handleIntroChange("stat2Label", e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded px-2.5 py-1 text-xs text-neutral-300"
              />
            </div>

            <div className="bg-black/40 p-3 rounded border border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-mono text-luxury-brass">Stat Card 3</span>
              <input
                type="text"
                placeholder="Value (e.g. W1)"
                value={introForm.stat3Value}
                onChange={(e) => handleIntroChange("stat3Value", e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded px-2.5 py-1 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Label (e.g. Fitzrovia, London)"
                value={introForm.stat3Label}
                onChange={(e) => handleIntroChange("stat3Label", e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded px-2.5 py-1 text-xs text-neutral-300"
              />
            </div>
          </div>

          {/* Intro Photography & Overlay Tags */}
          <div className="md:col-span-2 bg-black/40 p-4 rounded border border-white/10 space-y-3">
            <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono">
              Intro Architectural Photography
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Image URL or upload..."
                value={introForm.image}
                onChange={(e) => handleIntroChange("image", e.target.value)}
                className="flex-1 bg-black/60 border border-white/15 rounded px-3 py-2 text-xs text-white"
              />
              <label className="btn-luxury cursor-pointer inline-flex items-center gap-2 text-xs whitespace-nowrap">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "introImage")}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Image Tag Left</label>
                <input
                  type="text"
                  value={introForm.imageTag}
                  onChange={(e) => handleIntroChange("imageTag", e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded px-2.5 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1">Address Tag Right</label>
                <input
                  type="text"
                  value={introForm.imageAddress}
                  onChange={(e) => handleIntroChange("imageAddress", e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded px-2.5 py-1 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Videos Section */}
      <div className="bg-luxury-black/80 border border-white/10 p-6 rounded space-y-6">
        <h3 className="text-xs uppercase tracking-ultra text-luxury-brass font-mono border-b border-white/10 pb-3 flex items-center gap-2">
          <Video className="w-4 h-4" />
          <span>2. Cinematic Video Upload & Storage</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teaser Video */}
          <div className="p-4 rounded border border-white/10 bg-black/40 space-y-3">
            <label className="block text-xs uppercase tracking-widest text-luxury-brass font-mono">
              Hero Loop Background Video (MP4 / URL)
            </label>
            <p className="text-neutral-400 text-xs font-light">
              Current: <span className="text-white font-mono truncate block">{configForm.film.teaserSrc}</span>
            </p>

            <div className="space-y-2 pt-1">
              <input
                type="text"
                value={configForm.film.teaserSrc}
                onChange={(e) => handleFilmChange("teaserSrc", e.target.value)}
                placeholder="https://domain.com/video.mp4 or /uploads/..."
                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-luxury-brass"
              />

              <div className="flex flex-col gap-2">
                <label className={`btn-luxury-ghost cursor-pointer inline-flex items-center gap-2 text-xs ${uploadingField === "teaserSrc" ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploadingField === "teaserSrc" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-brass" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingField === "teaserSrc" ? "Uploading MP4..." : "Upload MP4 File"}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    disabled={uploadingField === "teaserSrc"}
                    onChange={(e) => handleFileUpload(e, "teaserSrc")}
                    className="hidden"
                  />
                </label>

                {uploadingField === "teaserSrc" && uploadingInfo && (
                  <div className="flex items-center gap-2 text-xs text-luxury-brass bg-luxury-brass/10 px-3 py-2 rounded border border-luxury-brass/30 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-brass shrink-0" />
                    <span>Uploading {uploadingInfo.name} ({uploadingInfo.sizeMb} MB)... Please wait.</span>
                  </div>
                )}

                {uploadStatusMsg && uploadStatusMsg.field === "teaserSrc" && (
                  <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded border ${uploadStatusMsg.isError ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
                    {uploadStatusMsg.isError ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>{uploadStatusMsg.text}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Film Video */}
          <div className="p-4 rounded border border-white/10 bg-black/40 space-y-3">
            <label className="block text-xs uppercase tracking-widest text-luxury-brass font-mono">
              Full Campaign Film Video (MP4 / URL)
            </label>
            <p className="text-neutral-400 text-xs font-light">
              Current: <span className="text-white font-mono truncate block">{configForm.film.fullSrc}</span>
            </p>

            <div className="space-y-2 pt-1">
              <input
                type="text"
                value={configForm.film.fullSrc}
                onChange={(e) => handleFilmChange("fullSrc", e.target.value)}
                placeholder="https://domain.com/video.mp4 or /uploads/..."
                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-luxury-brass"
              />

              <div className="flex flex-col gap-2">
                <label className={`btn-luxury-ghost cursor-pointer inline-flex items-center gap-2 text-xs ${uploadingField === "fullSrc" ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploadingField === "fullSrc" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-brass" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingField === "fullSrc" ? "Uploading MP4..." : "Upload MP4 File"}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    disabled={uploadingField === "fullSrc"}
                    onChange={(e) => handleFileUpload(e, "fullSrc")}
                    className="hidden"
                  />
                </label>

                {uploadingField === "fullSrc" && uploadingInfo && (
                  <div className="flex items-center gap-2 text-xs text-luxury-brass bg-luxury-brass/10 px-3 py-2 rounded border border-luxury-brass/30 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-brass shrink-0" />
                    <span>Uploading {uploadingInfo.name} ({uploadingInfo.sizeMb} MB)... Please wait.</span>
                  </div>
                )}

                {uploadStatusMsg && uploadStatusMsg.field === "fullSrc" && (
                  <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded border ${uploadStatusMsg.isError ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
                    {uploadStatusMsg.isError ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>{uploadStatusMsg.text}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brochure PDF Upload */}
      <div className="bg-luxury-black/80 border border-white/10 p-6 rounded space-y-6">
        <h3 className="text-xs uppercase tracking-ultra text-luxury-brass font-mono border-b border-white/10 pb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>3. Official Brochure PDF Document</span>
        </h3>

        <div className="p-4 rounded border border-white/10 bg-black/40 space-y-3">
          <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono">
            Downloadable PDF Brochure Path
          </label>
          <input
            type="text"
            value={configForm.brochurePath}
            onChange={(e) => handleConfigChange("brochurePath", e.target.value)}
            className="w-full bg-black/60 border border-white/15 rounded px-4 py-2 text-xs text-white focus:outline-none"
          />

          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-3">
              <label className={`btn-luxury cursor-pointer inline-flex items-center gap-2 text-xs ${uploadingField === "brochurePath" ? "opacity-50 pointer-events-none" : ""}`}>
                {uploadingField === "brochurePath" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-brass" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingField === "brochurePath" ? "Uploading PDF..." : "Upload Replacement PDF"}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={uploadingField === "brochurePath"}
                  onChange={(e) => handleFileUpload(e, "brochurePath")}
                  className="hidden"
                />
              </label>

              {configForm.brochurePath && (
                <a
                  href={configForm.brochurePath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-luxury-brass hover:underline"
                >
                  Preview PDF
                </a>
              )}
            </div>

            {uploadingField === "brochurePath" && uploadingInfo && (
              <div className="flex items-center gap-2 text-xs text-luxury-brass bg-luxury-brass/10 px-3 py-2 rounded border border-luxury-brass/30 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-brass shrink-0" />
                <span>Uploading {uploadingInfo.name} ({uploadingInfo.sizeMb} MB)... Please wait.</span>
              </div>
            )}

            {uploadStatusMsg && uploadStatusMsg.field === "brochurePath" && (
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded border ${uploadStatusMsg.isError ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
                {uploadStatusMsg.isError ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <Check className="w-3.5 h-3.5 shrink-0" />}
                <span>{uploadStatusMsg.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Floor Plans PDF Upload */}
        <div className="p-4 rounded border border-white/10 bg-black/40 space-y-3">
          <label className="block text-xs uppercase tracking-widest text-neutral-300 font-mono">
            Floor Plans PDF Document Path
          </label>
          <input
            type="text"
            value={configForm.floorPlansPdfPath || ""}
            onChange={(e) => handleConfigChange("floorPlansPdfPath", e.target.value)}
            className="w-full bg-black/60 border border-white/15 rounded px-4 py-2 text-xs text-white focus:outline-none"
            placeholder="/assets/the-bolsover-floorplans.pdf"
          />

          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-3">
              <label className={`btn-luxury cursor-pointer inline-flex items-center gap-2 text-xs ${uploadingField === "floorPlansPdfPath" ? "opacity-50 pointer-events-none" : ""}`}>
                {uploadingField === "floorPlansPdfPath" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-brass" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingField === "floorPlansPdfPath" ? "Uploading Floor Plans PDF..." : "Upload Floor Plans PDF"}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={uploadingField === "floorPlansPdfPath"}
                  onChange={(e) => handleFileUpload(e, "floorPlansPdfPath")}
                  className="hidden"
                />
              </label>

              {configForm.floorPlansPdfPath && (
                <a
                  href={configForm.floorPlansPdfPath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-luxury-brass hover:underline"
                >
                  Preview Floor Plans PDF
                </a>
              )}
            </div>

            {uploadingField === "floorPlansPdfPath" && uploadingInfo && (
              <div className="flex items-center gap-2 text-xs text-luxury-brass bg-luxury-brass/10 px-3 py-2 rounded border border-luxury-brass/30 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-brass shrink-0" />
                <span>Uploading {uploadingInfo.name} ({uploadingInfo.sizeMb} MB)... Please wait.</span>
              </div>
            )}

            {uploadStatusMsg && uploadStatusMsg.field === "floorPlansPdfPath" && (
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded border ${uploadStatusMsg.isError ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
                {uploadStatusMsg.isError ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <Check className="w-3.5 h-3.5 shrink-0" />}
                <span>{uploadStatusMsg.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
