"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sliders, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  X, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  List,
  Type,
  Phone,
  Mail,
  FileText,
  CheckSquare
} from "lucide-react";

export interface FormFieldItem {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea" | "checkbox" | string;
  placeholder: string;
  required: boolean;
  options: string[];
  order: number;
  enabled: boolean;
}

export const FormBuilderEditor: React.FC = () => {
  const [fields, setFields] = useState<FormFieldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Field Edit Modal State
  const [editingField, setEditingField] = useState<FormFieldItem | null>(null);
  const [isNewField, setIsNewField] = useState(false);

  // Form Field State
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<string>("text");
  const [fieldPlaceholder, setFieldPlaceholder] = useState("");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldEnabled, setFieldEnabled] = useState(true);
  const [fieldOptionsText, setFieldOptionsText] = useState("");

  // Delete Confirm State
  const [deleteConfirmField, setDeleteConfirmField] = useState<FormFieldItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/form-builder");
      const json = await res.json();
      if (json.success && json.data) {
        setFields(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch form fields:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleOpenAddField = () => {
    setIsNewField(true);
    setFieldLabel("");
    setFieldName("");
    setFieldType("text");
    setFieldPlaceholder("");
    setFieldRequired(false);
    setFieldEnabled(true);
    setFieldOptionsText("");
    setEditingField({
      id: "",
      name: "",
      label: "",
      type: "text",
      placeholder: "",
      required: false,
      options: [],
      order: fields.length,
      enabled: true
    });
  };

  const handleOpenEditField = (field: FormFieldItem) => {
    setIsNewField(false);
    setEditingField(field);
    setFieldLabel(field.label);
    setFieldName(field.name);
    setFieldType(field.type);
    setFieldPlaceholder(field.placeholder || "");
    setFieldRequired(field.required);
    setFieldEnabled(field.enabled);
    setFieldOptionsText(Array.isArray(field.options) ? field.options.join("\n") : "");
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel || !fieldName) return;
    setSaving(true);

    const parsedOptions = fieldOptionsText
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const url = "/api/form-builder";
      const method = isNewField ? "POST" : "PUT";
      const payload: any = {
        label: fieldLabel,
        name: fieldName,
        type: fieldType,
        placeholder: fieldPlaceholder,
        required: fieldRequired,
        enabled: fieldEnabled,
        options: parsedOptions
      };

      if (!isNewField && editingField) {
        payload.id = editingField.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        setEditingField(null);
        fetchFields();
      }
    } catch (err) {
      console.error("Failed to save field:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (field: FormFieldItem) => {
    try {
      const res = await fetch("/api/form-builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: field.id,
          enabled: !field.enabled
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchFields();
      }
    } catch (err) {
      console.error("Failed to toggle field state:", err);
    }
  };

  const handleMoveField = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const newItems = [...fields];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);

    setFields(newItems);

    try {
      await fetch("/api/form-builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          items: newItems.map((f, i) => ({ id: f.id, order: i }))
        })
      });
    } catch (err) {
      console.error("Failed to reorder form fields:", err);
    }
  };

  const handleDeleteField = async () => {
    if (!deleteConfirmField) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/form-builder?id=${deleteConfirmField.id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setDeleteConfirmField(null);
        fetchFields();
      }
    } catch (err) {
      console.error("Failed to delete field:", err);
    } finally {
      setDeleting(false);
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case "email": return Mail;
      case "tel": return Phone;
      case "select": return List;
      case "textarea": return FileText;
      case "checkbox": return CheckSquare;
      default: return Type;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-luxury-brass animate-pulse" />
            <h2 className="font-serif text-3xl text-white font-light">
              Registration Form Builder
            </h2>
          </div>
          <p className="text-neutral-400 text-xs font-light mt-1">
            Customize form fields, input types, order, and validation for public website enquiry forms.
          </p>
        </div>

        <button
          onClick={handleOpenAddField}
          className="btn-luxury text-xs py-2.5 px-4 inline-flex items-center gap-2 font-semibold shadow-lg"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Add Form Field</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Field Manager List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-white/10 pb-2">
            <span>Configured Fields ({fields.length})</span>
            <span>Sequence Controls</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-neutral-500 font-mono text-xs">
              Loading Form Configuration...
            </div>
          ) : fields.length === 0 ? (
            <div className="p-8 text-center border border-white/10 bg-black/40 rounded-lg space-y-2">
              <Sliders className="w-6 h-6 text-neutral-600 mx-auto" />
              <p className="text-neutral-400 text-sm">No custom fields defined</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, idx) => {
                const IconComponent = getFieldTypeIcon(field.type);
                return (
                  <div
                    key={field.id}
                    className={`p-4 rounded-lg border flex items-center justify-between transition-all ${
                      field.enabled
                        ? "bg-luxury-black/90 border-white/10 hover:border-luxury-brass/50 shadow-xl"
                        : "bg-black/40 border-white/5 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded bg-white/5 border border-white/10 flex items-center justify-center text-luxury-brass shrink-0">
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base text-white font-medium">
                            {field.label}
                          </h4>
                          {field.required && (
                            <span className="text-[9px] font-mono text-luxury-brass bg-luxury-brass/10 border border-luxury-brass/30 px-1.5 py-0.5 rounded">
                              REQUIRED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 mt-0.5">
                          <span>Key: <code className="text-neutral-300">{field.name}</code></span>
                          <span>•</span>
                          <span className="capitalize">{field.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Enable/Disable Toggle */}
                      <button
                        onClick={() => handleToggleEnabled(field)}
                        className={`p-1.5 rounded transition-colors text-xs font-mono flex items-center gap-1 ${
                          field.enabled
                            ? "text-emerald-400 hover:bg-emerald-950/40"
                            : "text-neutral-500 hover:bg-white/5"
                        }`}
                        title={field.enabled ? "Disable Field" : "Enable Field"}
                      >
                        {field.enabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-neutral-600" />}
                      </button>

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1 border-l border-r border-white/10 px-2">
                        <button
                          onClick={() => handleMoveField(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveField(idx, "down")}
                          disabled={idx === fields.length - 1}
                          className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Edit & Delete */}
                      <button
                        onClick={() => handleOpenEditField(field)}
                        className="p-1.5 rounded text-neutral-400 hover:text-luxury-brass hover:bg-white/5 transition-colors"
                        title="Edit Field"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmField(field)}
                        className="p-1.5 rounded text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete Field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Form Interactive Preview */}
        <div className="lg:col-span-5 bg-luxury-charcoal border border-white/15 p-6 md:p-8 rounded-xl shadow-2xl space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-luxury-brass">
              <Eye className="w-4 h-4" />
              <span>Live Public Form Preview</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">Updates Real-Time</span>
          </div>

          <p className="text-xs text-neutral-300 font-light leading-relaxed">
            This is an exact preview of how registration forms render live on the website based on your configuration above:
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs font-mono">
            {fields.filter(f => f.enabled).map((field) => (
              <div key={field.id || field.name} className="space-y-1.5">
                <label className="block text-neutral-300 uppercase tracking-wider">
                  {field.label} {field.required && <span className="text-luxury-brass">*</span>}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder}
                    className="w-full p-3 bg-black border border-white/10 rounded text-white placeholder-neutral-500 focus:border-luxury-brass focus:outline-none"
                  />
                ) : field.type === "select" ? (
                  <select className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none">
                    <option value="">{field.placeholder || "-- Select Option --"}</option>
                    {(Array.isArray(field.options) ? field.options : []).map((opt, oIdx) => (
                      <option key={oIdx} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer pt-1">
                    <input type="checkbox" className="w-4 h-4 accent-luxury-brass" />
                    <span>{field.placeholder || field.label}</span>
                  </label>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full p-3 bg-black border border-white/10 rounded text-white placeholder-neutral-500 focus:border-luxury-brass focus:outline-none"
                  />
                )}
              </div>
            ))}

            <button
              type="button"
              className="w-full btn-luxury text-xs py-3 uppercase tracking-widest font-semibold mt-4 shadow-xl"
            >
              Submit Registration (Preview)
            </button>
          </form>
        </div>
      </div>

      {/* EDIT / ADD FIELD MODAL */}
      <AnimatePresence>
        {editingField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-luxury-black border border-white/15 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 relative text-neutral-100"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-serif text-2xl text-white font-normal">
                  {isNewField ? "Add New Form Field" : `Edit Field: ${editingField.label}`}
                </h3>
                <button
                  onClick={() => setEditingField(null)}
                  className="p-2 rounded-full text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveField} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1">
                    Field Label (Public Display)
                  </label>
                  <input
                    type="text"
                    required
                    value={fieldLabel}
                    onChange={(e) => {
                      setFieldLabel(e.target.value);
                      if (isNewField) {
                        setFieldName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "_"));
                      }
                    }}
                    placeholder="e.g. Preferred Contact Time"
                    className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase tracking-wider mb-1">
                    Unique Key Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="e.g. contact_time"
                    className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1">
                      Field Input Type
                    </label>
                    <select
                      value={fieldType}
                      onChange={(e) => setFieldType(e.target.value)}
                      className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                    >
                      <option value="text">Text Input</option>
                      <option value="email">Email Address</option>
                      <option value="tel">Telephone Number</option>
                      <option value="select">Dropdown Select</option>
                      <option value="textarea">Textarea (Multi-line)</option>
                      <option value="checkbox">Checkbox Toggle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1">
                      Input Placeholder
                    </label>
                    <input
                      type="text"
                      value={fieldPlaceholder}
                      onChange={(e) => setFieldPlaceholder(e.target.value)}
                      placeholder="e.g. Enter details..."
                      className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dropdown options text */}
                {fieldType === "select" && (
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1">
                      Dropdown Options (One per line)
                    </label>
                    <textarea
                      rows={4}
                      value={fieldOptionsText}
                      onChange={(e) => setFieldOptionsText(e.target.value)}
                      placeholder={"Morning (09:00 - 12:00)\nAfternoon (12:00 - 17:00)\nEvening (17:00 - 20:00)"}
                      className="w-full p-3 bg-black border border-white/10 rounded text-white font-sans focus:border-luxury-brass focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fieldRequired}
                      onChange={(e) => setFieldRequired(e.target.checked)}
                      className="w-4 h-4 accent-luxury-brass"
                    />
                    <span className="text-neutral-300">Required Field</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fieldEnabled}
                      onChange={(e) => setFieldEnabled(e.target.checked)}
                      className="w-4 h-4 accent-luxury-brass"
                    />
                    <span className="text-neutral-300">Active & Enabled</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="btn-luxury-ghost text-xs py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-luxury text-xs py-2.5 px-6 font-semibold"
                  >
                    {saving ? "Saving Field..." : isNewField ? "Create Form Field" : "Update Form Field"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESTRUCTIVE DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-luxury-black border border-rose-500/30 p-6 rounded-xl shadow-2xl space-y-6 text-neutral-100"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h3 className="font-serif text-xl font-normal text-white">
                  Delete Custom Form Field
                </h3>
              </div>

              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                Are you sure you want to delete the form field <strong className="text-white font-medium">{deleteConfirmField.label}</strong> (<code className="text-luxury-brass">{deleteConfirmField.name}</code>)? This will remove it from all public registration forms.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmField(null)}
                  className="btn-luxury-ghost text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteField}
                  disabled={deleting}
                  className="px-4 py-2 rounded bg-rose-900/60 hover:bg-rose-800 border border-rose-500/50 text-rose-200 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  {deleting ? "Deleting Field..." : "Delete Form Field"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
