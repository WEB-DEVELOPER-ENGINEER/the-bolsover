"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCMS } from "@/context/CMSContext";
import { FloorLevelData } from "@/data/floorPlansData";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  Check, 
  AlertTriangle, 
  X, 
  Image as ImageIcon,
  Layers,
  Sparkles,
  RefreshCw
} from "lucide-react";

export const FloorPlansEditor: React.FC = () => {
  const { data, addFloorLevel, updateFloorLevel, deleteFloorLevel, reorderFloorLevels, mediaAssets, uploadFile } = useCMS();
  
  // Floor levels ordered by sequence position (order)
  const floorLevels = data.floorLevels ? [...data.floorLevels].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];

  // Modals state
  const [editingFloor, setEditingFloor] = useState<FloorLevelData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingFloor, setDeletingFloor] = useState<FloorLevelData | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<FloorLevelData>>({
    floorCode: "",
    title: "",
    subtitle: "",
    unitsRange: "",
    residenceCount: 1,
    areaSqFtRange: "",
    areaSqMRange: "",
    highlight: "",
    description: "",
    masterImage: "",
    order: 0
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const resetForm = () => {
    setFormData({
      floorCode: "",
      title: "",
      subtitle: "",
      unitsRange: "",
      residenceCount: 1,
      areaSqFtRange: "",
      areaSqMRange: "",
      highlight: "",
      description: "",
      masterImage: "",
      order: floorLevels.length
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (floor: FloorLevelData) => {
    setEditingFloor(floor);
    setFormData({ ...floor });
  };

  // Reorder up / down helpers
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const reordered = [...floorLevels];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    await reorderFloorLevels(reordered);
    setStatusMessage({ type: "success", text: "Floor sequence updated!" });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= floorLevels.length - 1) return;
    const reordered = [...floorLevels];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    await reorderFloorLevels(reordered);
    setStatusMessage({ type: "success", text: "Floor sequence updated!" });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Handle image upload from computer inside form
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploaded = await uploadFile(file);
    setUploadingImage(false);

    if (uploaded) {
      setFormData(prev => ({ ...prev, masterImage: uploaded.url }));
    }
  };

  // Submit Add
  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await addFloorLevel({
      ...formData,
      levelIndex: floorLevels.length,
      order: floorLevels.length
    });
    setSaving(false);

    if (success) {
      setIsAddModalOpen(false);
      setStatusMessage({ type: "success", text: "New floor level created successfully!" });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: "error", text: "Failed to create floor level." });
    }
  };

  // Submit Edit
  const handleUpdateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFloor) return;

    setSaving(true);
    const success = await updateFloorLevel({
      ...formData,
      id: editingFloor.id
    });
    setSaving(false);

    if (success) {
      setEditingFloor(null);
      setStatusMessage({ type: "success", text: "Floor level updated successfully!" });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: "error", text: "Failed to update floor level." });
    }
  };

  // Confirm Delete (Destructive Step)
  const handleConfirmDelete = async () => {
    if (!deletingFloor) return;
    setSaving(true);
    const success = await deleteFloorLevel(deletingFloor.id);
    setSaving(false);

    if (success) {
      setDeletingFloor(null);
      setStatusMessage({ type: "success", text: `Deleted ${deletingFloor.title}` });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: "error", text: "Failed to delete floor level." });
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-ultra text-luxury-brass mb-1">
            <Layers className="w-4 h-4" />
            <span>Dynamic Sequence Manager</span>
          </div>
          <h2 className="font-serif text-3xl text-white font-light">
            Floor Plans Ascent Sequence
          </h2>
          <p className="text-neutral-400 text-sm font-light mt-1">
            Manage building floor levels, room stats, architectural copy, floorplan images, and vertical scroll sequence (`order`).
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-luxury text-xs px-5 py-3 inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Floor Level</span>
        </button>
      </div>

      {/* STATUS NOTIFICATION ALERT */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded border text-xs font-mono flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/60 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* FLOOR LEVELS SEQUENCED LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-neutral-400 px-2">
          <span>Building Ascent Sequence (Ascending Order)</span>
          <span>{floorLevels.length} Total Levels</span>
        </div>

        {floorLevels.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 rounded text-neutral-500 font-mono text-xs">
            No floor levels found in database. Click "Add New Floor Level" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {floorLevels.map((floor, index) => (
              <div
                key={floor.id}
                className="bg-black/60 border border-white/10 hover:border-luxury-brass/50 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-xl group"
              >
                {/* SEQUENCE REORDER CONTROLS & FLOOR INFO */}
                <div className="flex items-center gap-4">
                  {/* Sequence Position Controls */}
                  <div className="flex flex-col items-center gap-1 shrink-0 bg-neutral-900 border border-white/10 p-1.5 rounded">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-neutral-400 hover:text-luxury-brass disabled:opacity-20 transition-colors"
                      title="Move Up in Ascent Sequence"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-luxury-brass font-bold">
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === floorLevels.length - 1}
                      className="p-1 text-neutral-400 hover:text-luxury-brass disabled:opacity-20 transition-colors"
                      title="Move Down in Ascent Sequence"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Floorplan Image Preview */}
                  <div className="w-20 h-14 bg-neutral-900 border border-white/10 rounded overflow-hidden flex items-center justify-center p-1 shrink-0">
                    <img
                      src={floor.masterImage}
                      alt={floor.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-luxury-brass/20 text-luxury-brass text-[10px] font-mono font-bold">
                        LEVEL {floor.floorCode}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        {floor.unitsRange}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg text-white font-normal">
                      {floor.title}
                    </h3>
                    <p className="text-xs text-neutral-400 font-light line-clamp-1">
                      {floor.subtitle || floor.description}
                    </p>
                  </div>
                </div>

                {/* SPECS & ACTIONS */}
                <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <div className="text-right text-xs font-mono text-neutral-400 hidden sm:block">
                    <span className="text-luxury-brass font-bold block">{floor.areaSqFtRange}</span>
                    <span>{floor.residenceCount} Private Units</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(floor)}
                      className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-luxury-brass" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeletingFloor(floor)}
                      className="px-3 py-2 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition-colors border border-rose-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {(isAddModalOpen || editingFloor) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <div className="w-full max-w-2xl bg-luxury-black border border-white/20 p-6 sm:p-8 rounded-lg shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-ultra text-luxury-brass">
                    Floor Plan Editor
                  </span>
                  <h3 className="font-serif text-2xl text-white font-normal mt-0.5">
                    {editingFloor ? `Edit Floor Level: ${editingFloor.title}` : "Add New Floor Level"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingFloor(null);
                  }}
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingFloor ? handleUpdateFloor : handleCreateFloor} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 mb-1">Floor Code (e.g. LG, G, 01, 02)</label>
                    <input
                      type="text"
                      required
                      value={formData.floorCode || ""}
                      onChange={e => setFormData({ ...formData, floorCode: e.target.value })}
                      placeholder="e.g. 05"
                      className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Floor Level Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ""}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Fifth Floor Sky Suite"
                      className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Subtitle / Architectural Theme</label>
                  <input
                    type="text"
                    value={formData.subtitle || ""}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Panoramic Skyline Aspect"
                    className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-neutral-400 mb-1">Units Range</label>
                    <input
                      type="text"
                      value={formData.unitsRange || ""}
                      onChange={e => setFormData({ ...formData, unitsRange: e.target.value })}
                      placeholder="e.g. Apartments A26–A28"
                      className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Residence Count</label>
                    <input
                      type="number"
                      value={formData.residenceCount || 1}
                      onChange={e => setFormData({ ...formData, residenceCount: Number(e.target.value) })}
                      className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Area Range (sq ft)</label>
                    <input
                      type="text"
                      value={formData.areaSqFtRange || ""}
                      onChange={e => setFormData({ ...formData, areaSqFtRange: e.target.value })}
                      placeholder="e.g. 750 – 1,100 sq ft"
                      className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Area Range (sq m)</label>
                  <input
                    type="text"
                    value={formData.areaSqMRange || ""}
                    onChange={e => setFormData({ ...formData, areaSqMRange: e.target.value })}
                    placeholder="e.g. 69.6 – 102.1 sq m"
                    className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Highlight Architectural Feature</label>
                  <input
                    type="text"
                    value={formData.highlight || ""}
                    onChange={e => setFormData({ ...formData, highlight: e.target.value })}
                    placeholder="e.g. Private sky terrace access and vaulted lightwells"
                    className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description || ""}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed paragraph describing the floor level layout..."
                    className="w-full p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                  />
                </div>

                {/* IMAGE URL OR UPLOAD */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="block text-neutral-400">Master Floor Plan Drawing (Image URL / Upload)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      required
                      value={formData.masterImage || ""}
                      onChange={e => setFormData({ ...formData, masterImage: e.target.value })}
                      placeholder="https://... or /floor-plans/..."
                      className="flex-1 p-2.5 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none font-mono"
                    />

                    <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded cursor-pointer flex items-center gap-2 border border-white/10 shrink-0">
                      <Upload className="w-4 h-4 text-luxury-brass" />
                      <span>{uploadingImage ? "Uploading..." : "Upload Master Plan"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {formData.masterImage && (
                    <div className="mt-2 w-48 h-28 bg-black border border-white/10 rounded p-1 overflow-hidden">
                      <img src={formData.masterImage} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                {/* SUB-UNITS & RESIDENCES CONTROL */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-serif text-luxury-brass">Sub-Unit Residences & Individual Plans</h4>
                      <p className="text-[11px] text-neutral-400 font-sans">Add or edit specific apartment layouts on this floor level.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.subUnits || [];
                        const newId = `subunit-${Date.now()}`;
                        setFormData({
                          ...formData,
                          subUnits: [
                            ...current,
                            {
                              id: newId,
                              name: `Apartment ${current.length + 1}`,
                              unitCode: `Apt ${current.length + 1}`,
                              bedrooms: "2 Bedrooms",
                              areaSqFt: "850 sq ft",
                              areaSqM: "79 sq m",
                              image: formData.masterImage || "",
                              width: 1066,
                              height: 671
                            }
                          ]
                        });
                      }}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded border border-white/10 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-luxury-brass" />
                      <span>Add Apartment</span>
                    </button>
                  </div>

                  {(!formData.subUnits || formData.subUnits.length === 0) ? (
                    <p className="text-xs text-neutral-500 italic">No individual apartment layouts added yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
                      {formData.subUnits.map((sub, sIdx) => (
                        <div key={sub.id || sIdx} className="p-3 bg-black/60 border border-white/10 rounded space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-luxury-brass">Apartment #{sIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = (formData.subUnits || []).filter((_, idx) => idx !== sIdx);
                                setFormData({ ...formData, subUnits: next });
                              }}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <input
                              type="text"
                              value={sub.name}
                              onChange={e => {
                                const next = [...(formData.subUnits || [])];
                                next[sIdx] = { ...next[sIdx], name: e.target.value };
                                setFormData({ ...formData, subUnits: next });
                              }}
                              placeholder="Apartment Name"
                              className="p-2 bg-neutral-900 border border-white/10 rounded text-white"
                            />
                            <input
                              type="text"
                              value={sub.unitCode}
                              onChange={e => {
                                const next = [...(formData.subUnits || [])];
                                next[sIdx] = { ...next[sIdx], unitCode: e.target.value };
                                setFormData({ ...formData, subUnits: next });
                              }}
                              placeholder="Unit Code (e.g. Apt 20)"
                              className="p-2 bg-neutral-900 border border-white/10 rounded text-white"
                            />
                            <input
                              type="text"
                              value={sub.bedrooms}
                              onChange={e => {
                                const next = [...(formData.subUnits || [])];
                                next[sIdx] = { ...next[sIdx], bedrooms: e.target.value };
                                setFormData({ ...formData, subUnits: next });
                              }}
                              placeholder="Bedrooms (e.g. 2 Bedrooms)"
                              className="p-2 bg-neutral-900 border border-white/10 rounded text-white"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <input
                              type="text"
                              value={sub.areaSqFt}
                              onChange={e => {
                                const next = [...(formData.subUnits || [])];
                                next[sIdx] = { ...next[sIdx], areaSqFt: e.target.value };
                                setFormData({ ...formData, subUnits: next });
                              }}
                              placeholder="Sq Ft (e.g. 850 sq ft)"
                              className="p-2 bg-neutral-900 border border-white/10 rounded text-white"
                            />
                            <input
                              type="text"
                              value={sub.areaSqM || ""}
                              onChange={e => {
                                const next = [...(formData.subUnits || [])];
                                next[sIdx] = { ...next[sIdx], areaSqM: e.target.value };
                                setFormData({ ...formData, subUnits: next });
                              }}
                              placeholder="Sq M (e.g. 79 sq m)"
                              className="p-2 bg-neutral-900 border border-white/10 rounded text-white"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] text-neutral-400 font-mono block mb-1">Floor Plan Image URL:</span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={sub.image}
                                  onChange={e => {
                                    const next = [...(formData.subUnits || [])];
                                    next[sIdx] = { ...next[sIdx], image: e.target.value };
                                    setFormData({ ...formData, subUnits: next });
                                  }}
                                  placeholder="Image URL (https://...supabase.co/storage/...)"
                                  className="flex-1 p-2 bg-neutral-900 border border-white/10 rounded text-white font-mono text-[11px]"
                                />
                                <label className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded cursor-pointer shrink-0" title="Upload Image">
                                  <Upload className="w-3.5 h-3.5 text-luxury-brass" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const f = e.target.files?.[0];
                                      if (f) {
                                        const up = await uploadFile(f);
                                        if (up) {
                                          const next = [...(formData.subUnits || [])];
                                          next[sIdx] = { ...next[sIdx], image: up.url };
                                          setFormData({ ...formData, subUnits: next });
                                        }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-neutral-400 font-mono block">Apartment Vector PDF:</span>
                                {sub.pdfUrl && (
                                  <a
                                    href={sub.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-mono text-luxury-brass hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>Preview PDF</span>
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={sub.pdfUrl || ""}
                                  onChange={e => {
                                    const next = [...(formData.subUnits || [])];
                                    next[sIdx] = { ...next[sIdx], pdfUrl: e.target.value };
                                    setFormData({ ...formData, subUnits: next });
                                  }}
                                  placeholder="PDF URL (https://...supabase.co/storage/...)"
                                  className="flex-1 p-2 bg-neutral-900 border border-white/10 rounded text-white font-mono text-[11px]"
                                />
                                <label className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded cursor-pointer shrink-0" title="Upload PDF">
                                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={async (e) => {
                                      const f = e.target.files?.[0];
                                      if (f) {
                                        const up = await uploadFile(f);
                                        if (up) {
                                          const next = [...(formData.subUnits || [])];
                                          next[sIdx] = { ...next[sIdx], pdfUrl: up.url };
                                          setFormData({ ...formData, subUnits: next });
                                        }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingFloor(null);
                    }}
                    className="btn-luxury-ghost text-xs px-5 py-2.5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-luxury text-xs px-6 py-2.5 flex items-center gap-2"
                  >
                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingFloor ? "Save Floor Changes" : "Create Floor Level"}</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESTRUCTIVE DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingFloor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-luxury-black border border-rose-500/40 p-6 rounded-lg shadow-2xl space-y-6">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-serif text-xl text-white font-normal">
                  Confirm Destructive Deletion
                </h3>
              </div>

              <div className="space-y-3 text-xs text-neutral-300 font-mono">
                <p>
                  You are about to permanently delete <strong className="text-white">{deletingFloor.title}</strong> (Level {deletingFloor.floorCode}).
                </p>
                <p className="p-3 bg-rose-950/40 border border-rose-500/30 rounded text-rose-300">
                  ⚠️ Warning: This action is destructive and directly alters the 3D scroll ascent sequence on the live website.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setDeletingFloor(null)}
                  className="btn-luxury-ghost text-xs px-4 py-2.5"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmDelete}
                  disabled={saving}
                  className="px-5 py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Yes, Delete Floor</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
