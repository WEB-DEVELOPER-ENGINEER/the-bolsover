"use client";

import React, { useState, useEffect } from "react";
import { Save, Check, Phone, Mail, MapPin } from "lucide-react";
import { useCMS } from "@/context/CMSContext";

export const AmenitiesContactEditor: React.FC = () => {
  const { data, updateCMSData } = useCMS();
  const [contactForm, setContactForm] = useState(data.contactData);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (data.contactData) {
      setContactForm(data.contactData);
    }
  }, [data.contactData]);

  const handleContactChange = (field: string, val: string) => {
    setContactForm((prev) => ({ ...prev, [field]: val }));
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const success = await updateCMSData({
        contactData: contactForm
      });

      if (success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update services and contact details:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-white font-light">
            Sales Contact Control
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Manage official enquiries contact details.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="btn-luxury px-6 py-3 text-xs uppercase tracking-widest font-semibold flex items-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-black" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-black" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Sales Contact & Address Info */}
      <div className="bg-luxury-black/90 border border-white/10 p-6 rounded space-y-6">
        <h3 className="text-xs uppercase tracking-ultra text-luxury-brass font-mono border-b border-white/10 pb-3 flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>1. Sales & Marketing Contact Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-neutral-400 uppercase flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-luxury-brass" />
              <span>Enquiries Email Address</span>
            </label>
            <input
              type="email"
              value={contactForm.salesEmail}
              onChange={(e) => handleContactChange("salesEmail", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded p-3 text-xs text-white font-mono focus:border-luxury-brass outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-neutral-400 uppercase flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-luxury-brass" />
              <span>Sales Telephone Line</span>
            </label>
            <input
              type="text"
              value={contactForm.salesPhone}
              onChange={(e) => handleContactChange("salesPhone", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded p-3 text-xs text-white font-mono focus:border-luxury-brass outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-neutral-400 uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-luxury-brass" />
              <span>Physical Building Address</span>
            </label>
            <input
              type="text"
              value={contactForm.address}
              onChange={(e) => handleContactChange("address", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded p-3 text-xs text-white font-mono focus:border-luxury-brass outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-neutral-400 uppercase">
              Sales Suite Opening Hours
            </label>
            <input
              type="text"
              value={contactForm.openingHours}
              onChange={(e) => handleContactChange("openingHours", e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded p-3 text-xs text-white font-mono focus:border-luxury-brass outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-neutral-400 uppercase">
              Footer Form Eyebrow
            </label>
            <input
              type="text"
              value={contactForm.eyebrow || ""}
              onChange={(e) => handleContactChange("eyebrow", e.target.value)}
              placeholder="Private enquiries"
              className="w-full bg-black/60 border border-white/15 rounded p-3 text-xs text-white font-mono focus:border-luxury-brass outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-neutral-400 uppercase">
              Footer Form Heading Title
            </label>
            <input
              type="text"
              value={contactForm.title || ""}
              onChange={(e) => handleContactChange("title", e.target.value)}
              placeholder="Register your interest."
              className="w-full bg-black/60 border border-white/15 rounded p-3 text-xs text-white font-mono focus:border-luxury-brass outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-mono text-neutral-400 uppercase">
              Footer Form Lead Description
            </label>
            <textarea
              rows={2}
              value={contactForm.description || ""}
              onChange={(e) => handleContactChange("description", e.target.value)}
              placeholder="Leave your details and the sales team will be in touch about availability at The Bolsover."
              className="w-full bg-black/60 border border-white/15 rounded p-3 text-xs text-white font-mono focus:border-luxury-brass outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-mono text-neutral-400 uppercase">
              Footer Consent Agreement Text
            </label>
            <textarea
              rows={2}
              value={contactForm.consentText || ""}
              onChange={(e) => handleContactChange("consentText", e.target.value)}
              placeholder="I agree to be contacted about The Bolsover..."
              className="w-full bg-black/60 border border-white/15 rounded p-3 text-xs text-white font-mono focus:border-luxury-brass outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-neutral-400 uppercase">
              Submit Button Label
            </label>
            <input
              type="text"
              value={contactForm.submitButtonLabel || ""}
              onChange={(e) => handleContactChange("submitButtonLabel", e.target.value)}
              placeholder="Register interest"
              className="w-full bg-black/60 border border-white/15 rounded p-3 text-xs text-white font-mono focus:border-luxury-brass outline-none"
            />
          </div>
        </div>
      </div>


    </form>
  );
};
