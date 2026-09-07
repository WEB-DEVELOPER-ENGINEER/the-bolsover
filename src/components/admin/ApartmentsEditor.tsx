"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle,
  ImageIcon,
  Video,
  Upload,
  Loader2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useCMS, ApartmentRecord, ApartmentSlide } from "@/context/CMSContext";

export const ApartmentsEditor: React.FC = () => {
  const { apartments, updateApartment, addApartment, deleteApartment, uploadFile, mediaAssets } = useCMS();
  const [selectedApartmentNumber, setSelectedApartmentNumber] = useState<number>(9);
  const [activeApartment, setActiveApartment] = useState<ApartmentRecord | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  const [slideDims, setSlideDims] = useState<Record<string, { width: number; height: number }>>({});

  // Sync selected apartment form state
  useEffect(() => {
    if (apartments && apartments.length > 0) {
      const found = apartments.find((apt) => apt.number === selectedApartmentNumber) || apartments[0];
      if (found) {
        setSelectedApartmentNumber(found.number);
        // Normalize slides
        const slides: ApartmentSlide[] = found.slides || found.details?.slides || [];
        setActiveApartment({
          ...found,
          residenceType: found.residenceType || found.details?.residenceType || "",
          area: found.area || found.details?.area || "",
          floor: found.floor || found.details?.floor || "",
          description: found.description || found.details?.description || "",
          slides
        });
      }
    }
  }, [apartments, selectedApartmentNumber]);

  if (!activeApartment) {
    return (
      <div className="flex items-center justify-center p-12 text-neutral-400 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-luxury-brass mr-3" />
        <span>Loading Apartments Database...</span>
      </div>
    );
  }

  const handleFieldChange = (field: keyof ApartmentRecord, value: any) => {
    setActiveApartment((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSlideChange = (index: number, field: keyof ApartmentSlide, value: any) => {
    if (!activeApartment) return;
    const nextSlides = [...(activeApartment.slides || [])];
    if (nextSlides[index]) {
      nextSlides[index] = { ...nextSlides[index], [field]: value };
      setActiveApartment({ ...activeApartment, slides: nextSlides });
    }
  };

  const handleAddSlide = () => {
    if (!activeApartment) return;
    const newSlide: ApartmentSlide = {
      id: `slide_${Date.now()}`,
      label: "New Interior View",
      caption: "View description caption...",
      kind: "image",
      src: ""
    };
    setActiveApartment({
      ...activeApartment,
      slides: [...(activeApartment.slides || []), newSlide]
    });
  };

  const handleRemoveSlide = (index: number) => {
    if (!activeApartment) return;
    const nextSlides = (activeApartment.slides || []).filter((_, idx) => idx !== index);
    setActiveApartment({ ...activeApartment, slides: nextSlides });
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    if (!activeApartment || !activeApartment.slides) return;
    const slides = [...activeApartment.slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[targetIndex];
    slides[targetIndex] = temp;

    setActiveApartment({ ...activeApartment, slides });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIndex: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const slideId = activeApartment?.slides?.[slideIndex]?.id || `slide_${slideIndex}`;
      setUploadingSlideId(slideId);
      setStatusMessage(null);

      const uploaded = await uploadFile(file);
      setUploadingSlideId(null);

      if (uploaded && uploaded.url) {
        const isVid = file.type.startsWith("video/");
        handleSlideChange(slideIndex, "src", uploaded.url);
        handleSlideChange(slideIndex, "kind", isVid ? "video" : "image");
        setStatusMessage({ text: `Uploaded ${file.name} successfully!` });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ text: `Failed to upload ${file.name}`, isError: true });
      }
    }
  };

  const handleSaveApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApartment) return;

    setIsSaving(true);
    setSavedSuccess(false);
    setStatusMessage(null);

    const ok = await updateApartment({
      id: activeApartment.id,
      number: activeApartment.number,
      label: activeApartment.label,
      residenceType: activeApartment.residenceType || "",
      area: activeApartment.area || "",
      floor: activeApartment.floor || "",
      description: activeApartment.description || "",
      slides: activeApartment.slides || []
    });

    setIsSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setStatusMessage({ text: `${activeApartment.label} updated successfully!` });
      setTimeout(() => {
        setSavedSuccess(false);
        setStatusMessage(null);
      }, 4000);
    } else {
      setStatusMessage({ text: "Failed to update apartment. Please check server connection.", isError: true });
    }
  };

  const handleAddNewApartment = async () => {
    const nextNum = Math.max(...apartments.map((a) => a.number), 0) + 1;
    const formattedNum = String(nextNum).padStart(2, "0");
    const ok = await addApartment({
      number: nextNum,
      label: `Apartment ${formattedNum}`,
      residenceType: "Luxury Residence",
      area: "500–600 sq ft",
      floor: "1st Floor",
      description: "Bespoke Fitzrovia apartment with contemporary finishes.",
      slides: []
    });

    if (ok) {
      setSelectedApartmentNumber(nextNum);
      setStatusMessage({ text: `Created Apartment ${formattedNum}!` });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleDeleteCurrentApartment = async () => {
    if (!activeApartment) return;
    if (confirm(`Are you sure you want to delete ${activeApartment.label}?`)) {
      const ok = await deleteApartment({ id: activeApartment.id, number: activeApartment.number });
      if (ok) {
        const remaining = apartments.filter((a) => a.number !== activeApartment.number);
        if (remaining.length > 0) {
          setSelectedApartmentNumber(remaining[0].number);
        }
        setStatusMessage({ text: "Apartment deleted successfully." });
        setTimeout(() => setStatusMessage(null), 4000);
      }
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-brass/10 border border-luxury-brass/30 text-luxury-brass text-[10px] font-mono uppercase tracking-ultra mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Residences & Gallery CMS</span>
          </div>
          <h2 className="font-serif text-2xl text-white font-light">Apartments Manager</h2>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Manage specs, descriptions, images, and interactive video tours for all 24+ Fitzrovia apartments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewApartment}
          className="px-4 py-2.5 rounded bg-luxury-brass hover:bg-luxury-brass/90 text-black text-xs font-mono uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Apartment</span>
        </button>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded border text-xs font-mono flex items-center gap-3 ${
            statusMessage.isError
              ? "bg-rose-950/60 border-rose-500/40 text-rose-300"
              : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
          }`}
        >
          {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Apartment Selector (Left) & Form Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Apartment Selector List */}
        <div className="lg:col-span-4 bg-black/60 border border-white/10 rounded-lg p-4 space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-luxury-brass">
              All Apartments ({apartments.length})
            </span>
          </div>

          <div className="space-y-1">
            {apartments.map((apt) => {
              const isSelected = apt.number === selectedApartmentNumber;
              const hasSlides = (apt.slides?.length || apt.details?.slides?.length || 0) > 0;
              const isNine = apt.number === 9;

              return (
                <button
                  key={apt.number}
                  type="button"
                  onClick={() => setSelectedApartmentNumber(apt.number)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded text-xs font-mono transition-all text-left ${
                    isSelected
                      ? "bg-luxury-brass text-black font-semibold shadow-md"
                      : "bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`tabular-nums text-xs ${isSelected ? "text-black font-bold" : "text-luxury-brass"}`}>
                      {String(apt.number).padStart(2, "0")}
                    </span>
                    <span className="font-sans">{apt.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasSlides && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? "bg-black/30 text-black" : "bg-white/10 text-neutral-400"}`}>
                        {apt.slides?.length || apt.details?.slides?.length} views
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-black" : "text-neutral-500"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Apartment Details & Slides Editor Form */}
        <form onSubmit={handleSaveApartment} className="lg:col-span-8 bg-black/60 border border-white/10 rounded-lg p-6 space-y-6">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-luxury-brass">Editing Residence</span>
              <h3 className="font-serif text-2xl text-white mt-0.5">{activeApartment.label}</h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDeleteCurrentApartment}
                className="p-2.5 rounded border border-rose-500/30 hover:border-rose-500 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-mono transition-colors"
                title="Delete Apartment"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded bg-luxury-brass hover:bg-luxury-brass/90 text-black text-xs font-mono uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Residence</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Residence Specifications */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-luxury-brass flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Residence Specifications</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 mb-1.5 uppercase tracking-wider">Apartment Title / Label</label>
                <input
                  type="text"
                  required
                  value={activeApartment.label}
                  onChange={(e) => handleFieldChange("label", e.target.value)}
                  placeholder="e.g. Apartment 09"
                  className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5 uppercase tracking-wider">Residence Typology</label>
                <input
                  type="text"
                  value={activeApartment.residenceType}
                  onChange={(e) => handleFieldChange("residenceType", e.target.value)}
                  placeholder="e.g. Studio residence, 2-Bedroom Duplex"
                  className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5 uppercase tracking-wider">Internal Area</label>
                <input
                  type="text"
                  value={activeApartment.area}
                  onChange={(e) => handleFieldChange("area", e.target.value)}
                  placeholder="e.g. 485–540 sq ft"
                  className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5 uppercase tracking-wider">Floor Designation</label>
                <input
                  type="text"
                  value={activeApartment.floor}
                  onChange={(e) => handleFieldChange("floor", e.target.value)}
                  placeholder="e.g. 1st Floor, Penthouse"
                  className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1.5 text-xs font-mono uppercase tracking-wider">
                Residence Description
              </label>
              <textarea
                rows={3}
                value={activeApartment.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Architectural description of materials, joinery, and natural light..."
                className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none font-sans text-sm leading-relaxed transition-colors"
              />
            </div>
          </div>

          {/* Media Slides Gallery Manager */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-widest text-luxury-brass flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Residence Gallery Slides ({activeApartment.slides?.length || 0})</span>
              </h4>

              <button
                type="button"
                onClick={handleAddSlide}
                className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-luxury-brass" />
                <span>Add Slide</span>
              </button>
            </div>

            {(!activeApartment.slides || activeApartment.slides.length === 0) ? (
              <div className="p-8 border border-dashed border-white/10 rounded text-center text-neutral-400 text-xs font-mono space-y-2">
                <p>No imagery or video slides configured for {activeApartment.label}.</p>
                <p className="text-[11px] text-neutral-500">
                  Click "Add Slide" to upload living room photos or interactive 360 camera pan videos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeApartment.slides.map((slide, idx) => {
                  const isUploading = uploadingSlideId === slide.id;

                  return (
                    <div
                      key={slide.id || idx}
                      className="p-4 bg-luxury-black border border-white/10 rounded-lg space-y-4 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-luxury-brass">
                            Slide #{idx + 1}
                          </span>
                          <span className="text-xs font-mono text-neutral-400 uppercase">
                            ({slide.kind})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSlide(idx, "up")}
                            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (activeApartment.slides?.length || 0) - 1}
                            onClick={() => handleMoveSlide(idx, "down")}
                            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlide(idx)}
                            className="p-1 rounded text-rose-400 hover:text-rose-300 transition-colors ml-2"
                            title="Remove Slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <label className="block text-neutral-400 mb-1 uppercase tracking-wider">Slide Title / Label</label>
                          <input
                            type="text"
                            value={slide.label}
                            onChange={(e) => handleSlideChange(idx, "label", e.target.value)}
                            placeholder="e.g. Living room, Kitchen pan"
                            className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-neutral-400 mb-1 uppercase tracking-wider">Media Type</label>
                          <select
                            value={slide.kind}
                            onChange={(e) => handleSlideChange(idx, "kind", e.target.value as any)}
                            className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none transition-colors"
                          >
                            <option value="image">Static Image (.jpg, .png, .webp)</option>
                            <option value="video">Interactive Scrub Video (.mp4)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-neutral-400 mb-1 uppercase tracking-wider">Caption Text</label>
                          <input
                            type="text"
                            value={slide.caption}
                            onChange={(e) => handleSlideChange(idx, "caption", e.target.value)}
                            placeholder="Descriptive subtitle for this view..."
                            className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none font-sans text-xs transition-colors"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-neutral-400 uppercase tracking-wider">Media Asset Source URL</label>
                            {mediaAssets && mediaAssets.length > 0 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleSlideChange(idx, "src", e.target.value);
                                    const isVid = e.target.value.endsWith(".mp4") || e.target.value.endsWith(".webm");
                                    handleSlideChange(idx, "kind", isVid ? "video" : "image");
                                  }
                                }}
                                defaultValue=""
                                className="bg-neutral-900 border border-white/10 rounded px-2 py-0.5 text-[10px] text-luxury-brass focus:outline-none"
                              >
                                <option value="" disabled>Select from Media Vault...</option>
                                {mediaAssets.map((asset) => (
                                  <option key={asset.id} value={asset.url}>
                                    {asset.originalName || asset.filename}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slide.src}
                              onChange={(e) => handleSlideChange(idx, "src", e.target.value)}
                              placeholder="https://...supabase.co/storage/... or upload file"
                              className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none text-xs transition-colors"
                            />

                            <label className="px-3 py-2.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-luxury-brass" />}
                              <span>{isUploading ? "Uploading..." : "Upload File"}</span>
                              <input
                                type="file"
                                accept={slide.kind === "video" ? "video/*" : "image/*"}
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, idx)}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Media Preview Box */}
                        {slide.src && (
                          <div className="sm:col-span-2 mt-2 p-2.5 bg-black border border-white/10 rounded flex items-center gap-4">
                            <div className="w-24 h-16 bg-neutral-900 rounded overflow-hidden relative shrink-0 flex items-center justify-center">
                              {slide.kind === "video" ? (
                                <video src={slide.src} className="w-full h-full object-cover" muted />
                              ) : (
                                <img
                                  src={slide.src}
                                  alt={slide.label}
                                  onLoad={(e) => {
                                    const img = e.currentTarget;
                                    setSlideDims((prev) => ({
                                      ...prev,
                                      [slide.src]: { width: img.naturalWidth, height: img.naturalHeight }
                                    }));
                                  }}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>

                            <div className="text-[11px] font-mono text-neutral-400 truncate space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium truncate">{slide.label}</p>
                                {slideDims[slide.src] && (
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                                    slideDims[slide.src].width >= 1920
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                      : slideDims[slide.src].width >= 1200
                                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                      : "bg-red-500/10 border-red-500/30 text-red-300"
                                  }`}>
                                    {slideDims[slide.src].width} × {slideDims[slide.src].height} px {slideDims[slide.src].width >= 1920 ? "• Crisp" : ""}
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-neutral-500">{slide.src}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
