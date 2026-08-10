"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Film,
  Image as ImageIcon,
  MapPin,
  ShieldCheck,
  LayoutDashboard,
  ExternalLink,
  Sparkles,
  Database,
  Layers,
  ArrowLeft,
  Lock,
  LogOut,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Users,
  Sliders,
  Compass,
  Crown,
  Building2
} from "lucide-react";
import { CMSProvider, useCMS } from "@/context/CMSContext";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { HeroFilmEditor } from "@/components/admin/HeroFilmEditor";
import { AmenitiesContactEditor } from "@/components/admin/AmenitiesContactEditor";
import { FloorPlansEditor } from "@/components/admin/FloorPlansEditor";
import { ApartmentsEditor } from "@/components/admin/ApartmentsEditor";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { FormBuilderEditor } from "@/components/admin/FormBuilderEditor";
import { PrivacyPolicyEditor } from "@/components/admin/PrivacyPolicyEditor";
import { HomeImagesEditor } from "@/components/admin/HomeImagesEditor";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

function CMSDashboardContent() {
  const { data, mediaAssets, apartments, isLoading } = useCMS();
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "form-builder" | "media" | "apartments" | "home-images" | "hero" | "floor-plans" | "amenities" | "privacy-policy">("overview");

  // Authentication State
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  // Login Form State
  const [email, setEmail] = useState("admin@thebolsover.co.uk");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Check current session on mount
  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.user) {
          setUser(json.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const json = await res.json();
      if (res.ok && json.success && json.user) {
        setUser(json.user);
        setPassword("");
      } else {
        setLoginError(json.error || "Authentication failed.");
      }
    } catch (err: any) {
      setLoginError(err.message || "An error occurred during authentication.");
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  // Loading Session State
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-neutral-400 font-mono text-xs">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-4 h-4 animate-spin text-luxury-brass" />
          <span>Verifying Administrator Authorization...</span>
        </div>
      </div>
    );
  }

  // UNAUTHENTICATED LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-[#08080a] text-neutral-100 flex items-center justify-center p-6 selection:bg-luxury-brass selection:text-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-luxury-black border border-white/10 p-8 sm:p-10 rounded-xl shadow-2xl space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-brass/5 rounded-full blur-2xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-block">
              <img
                src="/assets/logos/bolsover-logo-new.svg"
                alt="The Bolsover"
                className="w-56 h-auto mx-auto"
              />
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-brass/10 border border-luxury-brass/30 text-luxury-brass text-[10px] font-mono uppercase tracking-ultra">
              <Lock className="w-3 h-3" />
              <span>Enterprise Admin Portal</span>
            </div>
            <h2 className="font-serif text-2xl text-white font-normal pt-1">
              Administrator Authentication
            </h2>
            <p className="text-xs text-neutral-400 font-light">
              Enter your credentials to access the 3–8 Bolsover Street CMS.
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded text-rose-300 text-xs font-mono flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5 text-xs font-mono">
            <div>
              <label className="block text-neutral-400 mb-1.5 uppercase tracking-wider">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thebolsover.co.uk"
                className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1.5 uppercase tracking-wider">
                Account Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full p-3 bg-black border border-white/10 rounded text-white focus:border-luxury-brass focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full btn-luxury text-xs py-3.5 uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-xl"
            >
              {loggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="text-center pt-2">
            <Link href="/" className="text-[11px] font-mono text-neutral-400 hover:text-luxury-brass transition-colors inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // AUTHENTICATED CMS DASHBOARD
  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 selection:bg-luxury-brass selection:text-black font-sans">

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#08080a]/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-luxury-brass transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Live Website</span>
          </Link>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-serif text-lg text-white font-medium tracking-wide">
              The Bolsover <span className="italic font-light text-neutral-400">Enterprise CMS</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs font-mono">
            <span className="text-luxury-brass font-bold">{user.name}</span>
            <span className="text-white/20">•</span>
            <span className="text-neutral-400">{user.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded border border-rose-500/30 hover:border-rose-500 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Dashboard Container */}
      <div className="max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-luxury-black/90 border border-white/10 rounded-lg p-4 space-y-6 sticky top-24 shadow-2xl">
          <div className="px-3 pt-2">
            <p className="text-[10px] font-mono uppercase tracking-ultra text-luxury-brass">
              Management Modules
            </p>
          </div>

          <nav className="space-y-1">
            {[
              { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard, count: null },
              { id: "leads", label: "Leads & Enquiries", icon: Users, count: null },
              { id: "form-builder", label: "Form Builder", icon: Sliders, count: null },
              { id: "media", label: "Media Asset Vault", icon: Folder, count: mediaAssets.length },
              { id: "apartments", label: "Apartments Directory", icon: Building2, count: apartments?.length || 0 },
              { id: "home-images", label: "Home Page Pictures", icon: ImageIcon, count: 6 },
              { id: "hero", label: "Hero & Video Manager", icon: Film, count: null },
              { id: "floor-plans", label: "Floor Plans Ascent", icon: Layers, count: data.floorLevels?.length || 0 },
              { id: "amenities", label: "Contact Details", icon: ShieldCheck, count: null },
              { id: "privacy-policy", label: "Privacy Policy Manager", icon: ShieldCheck, count: data.privacyPolicy?.sections?.length || 0 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded text-xs font-mono uppercase tracking-wider transition-all duration-300 ${isActive
                      ? "bg-luxury-brass text-black font-semibold shadow-lg shadow-luxury-brass/20"
                      : "text-neutral-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-luxury-brass"}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== null && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? "bg-black/20 text-black font-bold" : "bg-black/60 text-neutral-400 border border-white/10"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 bg-luxury-black/60 border border-white/10 rounded-lg p-6 md:p-8 min-h-[720px] shadow-2xl">
          <AnimatePresence mode="wait">

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="border-b border-white/10 pb-6">
                  <h2 className="font-serif text-3xl text-white font-light">
                    The Bolsover Content Overview
                  </h2>
                  <p className="text-neutral-400 text-sm font-light mt-1">
                    Enterprise content & media management control center for 3–8 Bolsover Street, London W1.
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded border border-white/10 bg-black/60 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-luxury-brass tracking-widest">Media Vault Files</span>
                    <p className="font-serif text-3xl text-white font-normal">{mediaAssets.length}</p>
                    <p className="text-xs text-neutral-400">Uploaded videos, images & PDFs</p>
                  </div>

                  <div className="p-5 rounded border border-white/10 bg-black/60 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-luxury-brass tracking-widest">Residences</span>
                    <p className="font-serif text-3xl text-white font-normal">{apartments?.length || 24}</p>
                    <p className="text-xs text-neutral-400">Managed studio to duplex units</p>
                  </div>

                  <div className="p-5 rounded border border-white/10 bg-black/60 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-luxury-brass tracking-widest">Floor Levels</span>
                    <p className="font-serif text-3xl text-white font-normal">{data.floorLevels?.length || 0}</p>
                    <p className="text-xs text-neutral-400">Sequenced 3D ascent floors</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* LEADS MANAGEMENT TAB */}
            {activeTab === "leads" && (
              <motion.div key="leads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <LeadsManager />
              </motion.div>
            )}

            {/* FORM BUILDER TAB */}
            {activeTab === "form-builder" && (
              <motion.div key="form-builder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <FormBuilderEditor />
              </motion.div>
            )}

            {/* MEDIA VAULT TAB */}
            {activeTab === "media" && (
              <motion.div key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <MediaLibrary />
              </motion.div>
            )}

            {/* APARTMENTS DIRECTORY TAB */}
            {activeTab === "apartments" && (
              <motion.div key="apartments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <ApartmentsEditor />
              </motion.div>
            )}

            {/* HOME IMAGES TAB */}
            {activeTab === "home-images" && (
              <motion.div key="home-images" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <HomeImagesEditor />
              </motion.div>
            )}

            {/* HERO FILM TAB */}
            {activeTab === "hero" && (
              <motion.div key="hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <HeroFilmEditor />
              </motion.div>
            )}

            {/* FLOOR PLANS ASCENT TAB */}
            {activeTab === "floor-plans" && (
              <motion.div key="floor-plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <FloorPlansEditor />
              </motion.div>
            )}

            {/* AMENITIES & CONTACT TAB */}
            {activeTab === "amenities" && (
              <motion.div key="amenities" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <AmenitiesContactEditor />
              </motion.div>
            )}

            {/* PRIVACY POLICY MANAGER TAB */}
            {activeTab === "privacy-policy" && (
              <motion.div key="privacy-policy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <PrivacyPolicyEditor />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return <CMSDashboardContent />;
}
