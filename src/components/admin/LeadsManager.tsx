"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Archive, 
  AlertCircle, 
  X, 
  MessageSquare, 
  Phone, 
  Mail, 
  Building, 
  Calendar,
  Sparkles,
  RefreshCw
} from "lucide-react";

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  interestType: string;
  message: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "ARCHIVED" | string;
  notes: string;
  sourceForm: string;
  customData: string;
  createdAt: string;
  updatedAt: string;
}

export const LeadsManager: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL");

  // Selected Lead for Detail Modal / Editing Notes
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingStatus, setEditingStatus] = useState<string>("NEW");
  const [updating, setUpdating] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmLead, setDeleteConfirmLead] = useState<LeadItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = "/api/leads";
      const params = new URLSearchParams();
      if (activeStatusFilter !== "ALL") params.append("status", activeStatusFilter);
      if (searchQuery) params.append("q", searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setLeads(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeStatusFilter, searchQuery]);

  const handleOpenLeadModal = (lead: LeadItem) => {
    setSelectedLead(lead);
    setEditingNotes(lead.notes || "");
    setEditingStatus(lead.status || "NEW");
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setUpdating(true);

    try {
      const res = await fetch("/api/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedLead.id,
          status: editingStatus,
          notes: editingNotes
        })
      });

      const json = await res.json();
      if (json.success) {
        setSelectedLead(null);
        fetchLeads();
      }
    } catch (err) {
      console.error("Failed to update lead:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteConfirmLead) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/leads?id=${deleteConfirmLead.id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setDeleteConfirmLead(null);
        fetchLeads();
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Interest Type", "Status", "Source Form", "Submitted Date", "Notes", "Message"];
    const rows = leads.map(l => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.interestType}"`,
      `"${l.status}"`,
      `"${l.sourceForm}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bolsover_Leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "CONTACTED":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "QUALIFIED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "ARCHIVED":
        return "bg-neutral-800 text-neutral-400 border-white/10";
      default:
        return "bg-neutral-800 text-neutral-300 border-white/10";
    }
  };

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-luxury-brass animate-pulse" />
            <h2 className="font-serif text-3xl text-white font-light">
              Leads & Enquiries Management
            </h2>
          </div>
          <p className="text-neutral-400 text-xs font-light mt-1">
            Track, filter, and manage private buyer enquiries submitted across all Bolsover website forms.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={leads.length === 0}
          className="btn-luxury-ghost text-xs py-2.5 px-4 inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-luxury-brass" />
          <span>Export CSV ({leads.length})</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 text-xs font-mono w-full md:w-auto">
          {["ALL", "NEW", "CONTACTED", "QUALIFIED", "ARCHIVED"].map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatusFilter(st)}
              className={`px-3.5 py-2 rounded uppercase tracking-wider transition-all ${
                activeStatusFilter === st
                  ? "bg-luxury-brass text-black font-semibold shadow-lg shadow-luxury-brass/20"
                  : "bg-black/60 text-neutral-400 border border-white/10 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-3 py-2 bg-black border border-white/10 rounded text-xs text-white placeholder-neutral-500 focus:border-luxury-brass focus:outline-none"
          />
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="p-12 text-center text-neutral-500 font-mono text-xs flex items-center justify-center gap-3">
          <RefreshCw className="w-4 h-4 animate-spin text-luxury-brass" />
          <span>Loading Enquiries Database...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center border border-white/10 bg-black/40 rounded-lg space-y-3">
          <Users className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="text-neutral-400 font-serif text-lg font-light">No enquiries found</p>
          <p className="text-neutral-500 text-xs font-light">
            {searchQuery || activeStatusFilter !== "ALL"
              ? "Try adjusting your search query or status filter."
              : "Form submissions will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-lg bg-black/60 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Applicant Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Interest Typology</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Status Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border uppercase tracking-wider font-semibold ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>

                  {/* Applicant Name & Source */}
                  <td className="py-4 px-4 font-serif text-neutral-100 font-medium whitespace-nowrap">
                    <div>
                      <span className="text-sm block text-white">{lead.name}</span>
                      <span className="text-[10px] font-mono text-neutral-500 font-light">{lead.sourceForm}</span>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="py-4 px-4 text-neutral-300 font-light whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-neutral-300">
                        <Mail className="w-3.5 h-3.5 text-luxury-brass shrink-0" />
                        <span>{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                          <Phone className="w-3 h-3 text-neutral-500 shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Interest */}
                  <td className="py-4 px-4 whitespace-nowrap text-neutral-300 font-light">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">
                      {lead.interestType}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                    {new Date(lead.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleOpenLeadModal(lead)}
                      className="px-3 py-1.5 rounded bg-white/5 hover:bg-luxury-brass hover:text-black border border-white/10 text-neutral-300 text-xs font-mono transition-all"
                    >
                      View & Manage
                    </button>
                    <button
                      onClick={() => setDeleteConfirmLead(lead)}
                      className="p-1.5 rounded text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* LEAD DETAIL & STATUS EDIT MODAL */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-luxury-black border border-white/15 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 relative text-neutral-100"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-ultra text-luxury-brass">
                    Applicant Enquiry File #{selectedLead.id.slice(-6)}
                  </span>
                  <h3 className="font-serif text-2xl text-white font-normal mt-0.5">
                    {selectedLead.name}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-full text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lead Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-black/60 p-4 rounded border border-white/10">
                <div className="space-y-1">
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Email Address</span>
                  <p className="text-white font-medium">{selectedLead.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Phone Number</span>
                  <p className="text-white font-medium">{selectedLead.phone || "Not Provided"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Preferred Typology</span>
                  <p className="text-luxury-brass">{selectedLead.interestType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Submission Source</span>
                  <p className="text-neutral-300">{selectedLead.sourceForm}</p>
                </div>
              </div>

              {/* Enquiry Message */}
              {selectedLead.message && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                    Applicant Message
                  </span>
                  <div className="p-4 rounded bg-black/80 border border-white/10 text-xs text-neutral-300 font-light leading-relaxed">
                    "{selectedLead.message}"
                  </div>
                </div>
              )}

              {/* Status Update & Executive Notes Form */}
              <form onSubmit={handleUpdateLead} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                      Lead Pipeline Status
                    </label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                      className="w-full p-3 bg-black border border-white/10 rounded text-xs text-white font-mono focus:border-luxury-brass focus:outline-none"
                    >
                      <option value="NEW">NEW (Uncontacted)</option>
                      <option value="CONTACTED">CONTACTED (Follow-upSent)</option>
                      <option value="QUALIFIED">QUALIFIED (Buyer Verified)</option>
                      <option value="ARCHIVED">ARCHIVED (Closed)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Internal Executive Notes (Private)
                  </label>
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Enter confidential notes, viewing dates, or client requirements..."
                    className="w-full p-3 bg-black border border-white/10 rounded text-xs text-white font-sans focus:border-luxury-brass focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="btn-luxury-ghost text-xs py-2.5 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-luxury text-xs py-2.5 px-6 font-semibold"
                  >
                    {updating ? "Saving Changes..." : "Save Lead Status & Notes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESTRUCTIVE DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmLead && (
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
                  Confirm Lead Deletion
                </h3>
              </div>

              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                Are you sure you want to permanently delete the lead enquiry record for <strong className="text-white font-medium">{deleteConfirmLead.name}</strong> ({deleteConfirmLead.email})? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmLead(null)}
                  className="btn-luxury-ghost text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteLead}
                  disabled={deleting}
                  className="px-4 py-2 rounded bg-rose-900/60 hover:bg-rose-800 border border-rose-500/50 text-rose-200 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  {deleting ? "Deleting Record..." : "Permanently Delete Lead"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
