"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { bolsoverConfig } from "@/data/projectData";
import { FloorLevelData } from "@/data/floorPlansData";

import { supabase } from "@/lib/supabase";

export interface MediaAsset {
  id?: string;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  category: "image" | "video" | "document" | string;
  createdAt: string;
}

export interface IntroData {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  image: string;
  imageTag: string;
  imageAddress: string;
}

export interface PrivacySection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface PrivacyPolicyData {
  id?: string;
  title: string;
  effectiveDate: string;
  published: boolean;
  sections: PrivacySection[];
  updatedAt?: string;
}

export interface ApartmentSlide {
  id: string;
  label: string;
  caption: string;
  kind: "image" | "video";
  src: string;
}

export interface ApartmentDetails {
  residenceType: string;
  area: string;
  floor: string;
  description: string;
  slides: ApartmentSlide[];
}

export interface ApartmentRecord {
  id?: string;
  number: number;
  label: string;
  residenceType?: string;
  area?: string;
  floor?: string;
  description?: string;
  slides?: ApartmentSlide[];
  details?: ApartmentDetails;
}

export interface CMSData {
  bolsoverConfig: typeof bolsoverConfig;
  heroData: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    introCopy: string;
  };
  introData: IntroData;
  floorLevels: FloorLevelData[];
  apartments?: ApartmentRecord[];
  privacyPolicy?: PrivacyPolicyData;
  contactData: {
    salesEmail: string;
    salesPhone: string;
    address: string;
    openingHours: string;
    eyebrow?: string;
    title?: string;
    description?: string;
    consentText?: string;
    submitButtonLabel?: string;
  };
}

interface CMSContextType {
  data: CMSData;
  mediaAssets: MediaAsset[];
  isLoading: boolean;
  apartments: ApartmentRecord[];
  updateCMSData: (newData: Partial<CMSData>) => Promise<boolean>;
  refreshMediaAssets: () => Promise<void>;
  uploadFile: (file: File) => Promise<MediaAsset | null>;
  deleteFile: (filename: string) => Promise<boolean>;
  refreshFloorLevels: () => Promise<void>;
  addFloorLevel: (floor: Partial<FloorLevelData>) => Promise<boolean>;
  updateFloorLevel: (floor: Partial<FloorLevelData> & { id: string }) => Promise<boolean>;
  deleteFloorLevel: (id: string) => Promise<boolean>;
  reorderFloorLevels: (items: FloorLevelData[]) => Promise<boolean>;
  refreshApartments: () => Promise<void>;
  addApartment: (apt: Partial<ApartmentRecord>) => Promise<boolean>;
  updateApartment: (apt: Partial<ApartmentRecord> & ({ id: string } | { number: number })) => Promise<boolean>;
  deleteApartment: (identifier: { id?: string; number?: number }) => Promise<boolean>;
}

const defaultCMSData: CMSData = {
  bolsoverConfig,
  heroData: {
    eyebrow: "Fitzrovia, London W1",
    titleLine1: "A Home That",
    titleLine2: "Brings London Closer",
    introCopy: "An exclusive collection of 24 luxury apartments at 3–8 Bolsover Street, London W1, set in the heart of Fitzrovia"
  },
  introData: {
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
  },
  contactData: {
    salesEmail: "enquiries@thebolsover-fitzrovia.co.uk",
    salesPhone: "+44 (0)20 7946 0188",
    address: "3–8 Bolsover Street, Fitzrovia, London W1W 6AB",
    openingHours: "Monday – Friday: 10:00 – 18:00 | Saturday: By Appointment",
    eyebrow: "Private enquiries",
    title: "Register your interest.",
    description: "Leave your details and the sales team will be in touch about availability at The Bolsover.",
    consentText: "I agree to be contacted about The Bolsover and to the handling of my information under the Privacy Policy.",
    submitButtonLabel: "Register interest"
  },
  floorLevels: [],
  privacyPolicy: {
    title: "Privacy & Data Governance Policy",
    effectiveDate: "29 July 2026",
    published: true,
    sections: [
      {
        id: "sec_1",
        title: "1. Overview & Data Controller",
        content: `The Bolsover ("we", "our", or "us"), located at 3–8 Bolsover Street, Fitzrovia, London W1, is committed to safeguarding the privacy and personal data of our prospective buyers, residents, visitors, and partners.\n\nThis Privacy Policy sets out how we collect, process, store, and protect your personal information in accordance with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, and relevant international privacy standards.`,
        order: 0
      },
      {
        id: "sec_2",
        title: "2. Personal Information We Collect",
        content: `We collect personal information necessary to deliver exceptional sales assistance, property consultations, and residence management services.\n\n- **Identity & Contact Information**: Full name, email address, telephone number, mailing address, and preferred language.\n- **Property Interests & Requirements**: Desired floorplan typology (e.g. Studio, Duplex, Penthouse), budget parameters, investment timeline, and financing preferences.\n- **Technical & Usage Data**: IP address, browser metadata, device fingerprinting, and interaction metrics on the digital experience.`,
        order: 1
      },
      {
        id: "sec_3",
        title: "3. How We Use Your Personal Data",
        content: `Your data is processed strictly under lawful bases specified by data protection regulations:\n\n1. **Fulfilling Consultation Requests**: Managing prospective viewings, digital floorplan downloads, and bespoke price sheet inquiries.\n2. **Sales & Legal Documentation**: Processing reservation agreements, identity verification (KYC/AML compliance), and contract exchange.\n3. **Tailored Communications**: Providing private updates on availability, construction milestones, and launch events (subject to your consent).`,
        order: 2
      },
      {
        id: "sec_4",
        title: "4. Data Sharing & Third-Party Partners",
        content: `We do not sell or rent your personal information to third parties. We may share information with trusted joint venture partners, accredited sales agencies (such as Savills and A'ayan Real Estate), and legal advisors solely for transaction fulfillment and concierge onboarding.`,
        order: 3
      },
      {
        id: "sec_5",
        title: "5. Data Security & Storage",
        content: `All personal information is stored within encrypted cloud infrastructures operating under strict ISO 27001 certification. We implement SSL/TLS 256-bit encryption for data in transit and multi-factor access controls.`,
        order: 4
      },
      {
        id: "sec_6",
        title: "6. Your Legal Rights",
        content: `Under data protection law, you have rights including:\n\n- **Right of Access**: Request copies of your personal data.\n- **Right to Rectification**: Correct inaccurate or incomplete details.\n- **Right to Erasure**: Request deletion of your personal data ('Right to be Forgotten').\n- **Right to Withdraw Consent**: Unsubscribe from marketing communications at any time.`,
        order: 5
      },
      {
        id: "sec_7",
        title: "7. Contact Our Privacy Office",
        content: `If you have questions regarding this Privacy Policy or wish to exercise your legal rights, please contact our Compliance Team:\n\n**Email**: privacy@thebolsover.com  \n**Address**: 3–8 Bolsover Street, Fitzrovia, London W1W 6AB`,
        order: 6
      }
    ]
  }
};

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CMSData>(defaultCMSData);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [apartments, setApartments] = useState<ApartmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch live CMS data and uploaded media assets
  const fetchCMSData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/cms", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Object.keys(json.data).length > 0) {
          setData((prev) => ({
            ...prev,
            ...json.data,
            bolsoverConfig: { ...prev.bolsoverConfig, ...(json.data.bolsoverConfig || {}) },
            heroData: { ...prev.heroData, ...(json.data.heroData || {}) },
            introData: { ...prev.introData, ...(json.data.introData || {}) },
            contactData: { ...prev.contactData, ...(json.data.contactData || {}) }
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load CMS data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMediaAssets = async () => {
    try {
      const res = await fetch("/api/upload");
      if (res.ok) {
        const json = await res.json();
        if (json.files) {
          setMediaAssets(json.files);
        }
      }
    } catch (err) {
      console.error("Failed to refresh media assets:", err);
    }
  };

  const refreshApartments = async () => {
    try {
      const res = await fetch("/api/apartments", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setApartments(json.data);
          setData((prev) => ({ ...prev, apartments: json.data }));
        }
      }
    } catch (err) {
      console.error("Failed to refresh apartments:", err);
    }
  };

  useEffect(() => {
    fetchCMSData();
    refreshMediaAssets();
    refreshFloorLevels();
    refreshApartments();
  }, []);

  const updateCMSData = async (newData: Partial<CMSData>): Promise<boolean> => {
    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
      });

      if (res.ok) {
        await fetchCMSData();
        return true;
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.error("Failed to save CMS data:", res.status, errJson);
        if (res.status === 401) {
          alert("Save Failed: Unauthorized. Please log in to the Admin Portal.");
        } else {
          alert(`Save Failed: ${errJson.error || "Server error (" + res.status + ")"}`);
        }
        return false;
      }
    } catch (err) {
      console.error("Failed to save CMS data:", err);
      alert("Failed to save CMS data: Network error");
      return false;
    }
  };

  const uploadFile = async (file: File): Promise<MediaAsset | null> => {
    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${timestamp}_${sanitizedName}`;

      // 1. Direct browser-to-Supabase Storage bucket upload (supports files up to 500 MB, bypassing Vercel limits)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("bolsover-media")
        .upload(filename, file, {
          contentType: file.type || "application/octet-stream",
          upsert: true
        });

      let publicUrl = "";

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from("bolsover-media").getPublicUrl(filename);
        publicUrl = urlData.publicUrl;
      }

      if (publicUrl) {
        const category = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "document";

        const assetRecord: MediaAsset = {
          id: filename,
          url: publicUrl,
          filename,
          originalName: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          category,
          createdAt: new Date().toISOString()
        };

        setMediaAssets((prev) => [assetRecord, ...prev]);
        return assetRecord;
      }

      // 2. Fallback to API endpoint if direct client upload fails
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.file) {
          setMediaAssets((prev) => [json.file, ...prev]);
          return json.file;
        }
      }
      return null;
    } catch (err) {
      console.error("File upload error:", err);
      return null;
    }
  };

  const deleteFile = async (filename: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename })
      });

      if (res.ok) {
        setMediaAssets((prev) => prev.filter((a) => a.filename !== filename && a.url !== filename));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Delete file error:", err);
      return false;
    }
  };

  const refreshFloorLevels = async () => {
    try {
      const res = await fetch("/api/floor-plans");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData((prev) => ({ ...prev, floorLevels: json.data }));
        }
      }
    } catch (err) {
      console.error("Failed to refresh floor levels:", err);
    }
  };

  const addFloorLevel = async (floor: Partial<FloorLevelData>): Promise<boolean> => {
    try {
      const res = await fetch("/api/floor-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(floor)
      });
      if (res.ok) {
        await refreshFloorLevels();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to add floor level:", err);
      return false;
    }
  };

  const updateFloorLevel = async (floor: Partial<FloorLevelData> & { id: string }): Promise<boolean> => {
    try {
      const res = await fetch("/api/floor-plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(floor)
      });
      if (res.ok) {
        await refreshFloorLevels();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update floor level:", err);
      return false;
    }
  };

  const deleteFloorLevel = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/floor-plans?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await refreshFloorLevels();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete floor level:", err);
      return false;
    }
  };

  const reorderFloorLevels = async (items: FloorLevelData[]): Promise<boolean> => {
    try {
      setData((prev) => ({ ...prev, floorLevels: items }));
      const res = await fetch("/api/floor-plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          items: items.map((item, idx) => ({ id: item.id, order: idx }))
        })
      });
      if (res.ok) {
        await refreshFloorLevels();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to reorder floor levels:", err);
      return false;
    }
  };

  const addApartment = async (apt: Partial<ApartmentRecord>): Promise<boolean> => {
    try {
      const res = await fetch("/api/apartments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apt)
      });
      if (res.ok) {
        await refreshApartments();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to add apartment:", err);
      return false;
    }
  };

  const updateApartment = async (apt: Partial<ApartmentRecord> & ({ id: string } | { number: number })): Promise<boolean> => {
    try {
      const res = await fetch("/api/apartments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apt)
      });
      if (res.ok) {
        await refreshApartments();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to update apartment:", err);
      return false;
    }
  };

  const deleteApartment = async (identifier: { id?: string; number?: number }): Promise<boolean> => {
    try {
      const query = identifier.id ? `id=${encodeURIComponent(identifier.id)}` : `number=${identifier.number}`;
      const res = await fetch(`/api/apartments?${query}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await refreshApartments();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete apartment:", err);
      return false;
    }
  };

  return (
    <CMSContext.Provider
      value={{
        data,
        mediaAssets,
        isLoading,
        apartments,
        updateCMSData,
        refreshMediaAssets,
        uploadFile,
        deleteFile,
        refreshFloorLevels,
        addFloorLevel,
        updateFloorLevel,
        deleteFloorLevel,
        reorderFloorLevels,
        refreshApartments,
        addApartment,
        updateApartment,
        deleteApartment
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
};
