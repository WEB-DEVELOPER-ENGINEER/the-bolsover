"use client";

import React, { useState, useEffect } from "react";
import { useCMS, PrivacyPolicyData, PrivacySection } from "@/context/CMSContext";
import {
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit3,
  Check,
  Loader2,
  Lock,
  Globe,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading,
  Link as LinkIcon
} from "lucide-react";

export const PrivacyPolicyEditor: React.FC = () => {
  const { data, updateCMSData } = useCMS();

  const [title, setTitle] = useState<string>("Privacy & Data Governance Policy");
  const [effectiveDate, setEffectiveDate] = useState<string>("29 July 2026");
  const [published, setPublished] = useState<boolean>(true);
  const [sections, setSections] = useState<PrivacySection[]>([]);

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (data.privacyPolicy) {
      setTitle(data.privacyPolicy.title || "Privacy & Data Governance Policy");
      setEffectiveDate(data.privacyPolicy.effectiveDate || "29 July 2026");
      setPublished(typeof data.privacyPolicy.published === "boolean" ? data.privacyPolicy.published : true);
      setSections(data.privacyPolicy.sections || []);
      if (data.privacyPolicy.sections?.length > 0 && !activeSectionId) {
        setActiveSectionId(data.privacyPolicy.sections[0].id);
      }
    }
  }, [data.privacyPolicy]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const updatedPolicy: PrivacyPolicyData = {
      title: title.trim() || "Privacy & Data Governance Policy",
      effectiveDate: effectiveDate.trim() || "29 July 2026",
      published,
      sections: sections.map((sec, idx) => ({ ...sec, order: idx }))
    };

    const success = await updateCMSData({ privacyPolicy: updatedPolicy });
    setIsSaving(false);

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleAddSection = () => {
    const newSec: PrivacySection = {
      id: `sec_${Date.now()}`,
      title: `${sections.length + 1}. New Policy Section`,
      content: "Enter detailed section content here. You can use markdown formatting like **bold text**, *italics*, bullet points (- item), or links.",
      order: sections.length
    };
    setSections([...sections, newSec]);
    setActiveSectionId(newSec.id);
  };

  const handleDeleteSection = (id: string) => {
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);
    if (activeSectionId === id) {
      setActiveSectionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSections(updated);
  };

  const handleSectionChange = (id: string, field: "title" | "content", value: string) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const insertFormatting = (id: string, syntax: string, placeholder = "text") => {
    const target = sections.find((s) => s.id === id);
    if (!target) return;

    let addition = "";
    switch (syntax) {
      case "bold":
        addition = ` **${placeholder}** `;
        break;
      case "italic":
        addition = ` *${placeholder}* `;
        break;
      case "heading":
        addition = `\n## ${placeholder}\n`;
        break;
      case "ul":
        addition = `\n- Item 1\n- Item 2\n`;
        break;
      case "ol":
        addition = `\n1. Item 1\n2. Item 2\n`;
        break;
      case "link":
        addition = ` [Link Description](https://example.com) `;
        break;
      default:
        break;
    }

    handleSectionChange(id, "content", target.content + addition);
  };

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="bg-luxury-black/90 border border-white/10 p-6 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-luxury-brass">
            <ShieldCheck className="w-4 h-4" />
            <span>Governance & Compliance Manager</span>
          </div>
          <h2 className="font-serif text-2xl text-white font-normal">
            Privacy Policy CMS Manager
          </h2>
          <p className="text-xs text-neutral-400 font-light">
            Manage section titles, legal clauses, rich text formatting, publication status, and effective dates.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Mode Switcher */}
          <div className="bg-black/60 p-1 rounded border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors flex items-center gap-1.5 ${
                activeTab === "edit" ? "bg-luxury-brass text-black font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors flex items-center gap-1.5 ${
                activeTab === "preview" ? "bg-luxury-brass text-black font-semibold" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-luxury inline-flex items-center gap-2 text-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Database...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Published to DB!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Meta Controls Card */}
      <div className="bg-luxury-black/90 border border-white/10 p-6 rounded space-y-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-luxury-brass border-b border-white/10 pb-3">
          Global Policy Settings & Publication Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-400 font-mono mb-2">
              Document Main Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-3 py-2 text-xs text-white focus:border-luxury-brass outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-400 font-mono mb-2">
              Effective / Last Updated Date
            </label>
            <input
              type="text"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded px-3 py-2 text-xs text-white focus:border-luxury-brass outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-400 font-mono mb-2">
              Publication Visibility Status
            </label>
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={`w-full py-2 px-4 rounded text-xs uppercase tracking-widest font-mono flex items-center justify-between border transition-colors ${
                published
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/40 text-amber-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {published ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{published ? "Published (Live on Site)" : "Draft Mode (Hidden)"}</span>
              </div>
              <span className="text-[10px] underline">{published ? "Unpublish" : "Publish"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor vs Preview Content View */}
      {activeTab === "edit" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Section List Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs uppercase tracking-widest text-luxury-brass font-mono">
                Policy Sections ({sections.length})
              </span>
              <button
                onClick={handleAddSection}
                className="btn-luxury-ghost text-xs px-2.5 py-1 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`p-3.5 rounded border transition-all cursor-pointer flex items-center justify-between group ${
                    activeSectionId === sec.id
                      ? "bg-luxury-brass/15 border-luxury-brass text-white shadow-md"
                      : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <div className="truncate pr-3">
                    <span className="text-[10px] font-mono text-luxury-brass block">
                      Section 0{idx + 1}
                    </span>
                    <span className="text-xs truncate block font-medium">{sec.title}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(idx, "up");
                      }}
                      disabled={idx === 0}
                      className="p-1 hover:text-luxury-brass disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(idx, "down");
                      }}
                      disabled={idx === sections.length - 1}
                      className="p-1 hover:text-luxury-brass disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(sec.id);
                      }}
                      className="p-1 hover:text-red-400 text-neutral-500"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Content Rich Text Editor */}
          <div className="lg:col-span-8">
            {currentSection ? (
              <div className="bg-luxury-black/90 border border-white/10 p-6 rounded space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-mono text-luxury-brass uppercase tracking-widest">
                    Editing Section: {currentSection.title}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">ID: {currentSection.id}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-400 font-mono mb-1.5">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={currentSection.title}
                      onChange={(e) => handleSectionChange(currentSection.id, "title", e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded px-3 py-2 text-sm text-white font-serif focus:border-luxury-brass outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-widest text-neutral-400 font-mono">
                        Rich Text Clause Body Content
                      </label>

                      {/* Formatting Toolbar */}
                      <div className="flex items-center gap-1 bg-black/60 p-1 rounded border border-white/10 text-xs">
                        <button
                          type="button"
                          onClick={() => insertFormatting(currentSection.id, "bold", "bold text")}
                          className="p-1 hover:text-luxury-brass text-neutral-300"
                          title="Bold (**text**)"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting(currentSection.id, "italic", "italic text")}
                          className="p-1 hover:text-luxury-brass text-neutral-300"
                          title="Italic (*text*)"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting(currentSection.id, "heading", "Subheading")}
                          className="p-1 hover:text-luxury-brass text-neutral-300"
                          title="Subheading (## Subheading)"
                        >
                          <Heading className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting(currentSection.id, "ul")}
                          className="p-1 hover:text-luxury-brass text-neutral-300"
                          title="Bulleted List (- item)"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting(currentSection.id, "ol")}
                          className="p-1 hover:text-luxury-brass text-neutral-300"
                          title="Numbered List (1. item)"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting(currentSection.id, "link")}
                          className="p-1 hover:text-luxury-brass text-neutral-300"
                          title="Hyperlink ([text](url))"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={14}
                      value={currentSection.content}
                      onChange={(e) => handleSectionChange(currentSection.id, "content", e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded p-4 text-xs text-neutral-200 font-mono leading-relaxed focus:border-luxury-brass outline-none custom-scrollbar"
                      placeholder="Write policy content..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-luxury-black/90 border border-white/10 p-12 rounded text-center text-neutral-500 text-xs font-mono">
                No policy section selected. Click "+ Add Section" to create one.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Live Preview Mode */
        <div className="bg-luxury-black border border-white/10 p-8 md:p-12 rounded space-y-8">
          <div className="border-b border-white/10 pb-6 space-y-2">
            <span className="text-xs uppercase tracking-widest text-luxury-brass font-mono">
              Live Preview Rendering Mode
            </span>
            <h1 className="font-serif text-3xl text-white">{title}</h1>
            <p className="text-xs font-mono text-neutral-400">Effective Date: {effectiveDate}</p>
          </div>

          <div className="space-y-8">
            {sections.map((sec, idx) => (
              <div key={sec.id} className="glass-panel p-6 rounded border border-white/10">
                <h3 className="font-serif text-xl text-white mb-4 pb-2 border-b border-white/10">
                  {sec.title}
                </h3>
                <div className="text-xs text-neutral-300 font-light space-y-2 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
