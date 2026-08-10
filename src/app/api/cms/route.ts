import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [
      config,
      hero,
      intro,
      contact,
      floorLevelsRaw,
      privacyPolicyRaw
    ] = await Promise.all([
      prisma.bolsoverConfig.findUnique({ where: { id: "config_singleton" } }).catch(() => null),
      prisma.heroData.findUnique({ where: { id: "hero_singleton" } }).catch(() => null),
      prisma.introData.findUnique({ where: { id: "intro_singleton" } }).catch(() => null),
      prisma.contactData.findUnique({ where: { id: "contact_singleton" } }).catch(() => null),
      prisma.floorLevel.findMany({ orderBy: { order: "asc" } }).catch(() => []),
      prisma.privacyPolicy.findUnique({ where: { id: "privacy_policy" } }).catch(() => null)
    ]);

    const floorLevels = floorLevelsRaw.map((fl: any) => ({
      ...fl,
      subUnits: typeof fl.subUnits === "string" ? JSON.parse(fl.subUnits || "[]") : (fl.subUnits || [])
    }));

    const data = {
      bolsoverConfig: config ? {
        film: {
          fullSrc: config.fullSrc,
          teaserSrc: config.teaserSrc,
          poster: config.poster,
          teaserSegments: typeof config.teaserSegments === "string" ? JSON.parse(config.teaserSegments || "[]") : (config.teaserSegments || []),
          desktopObjectPosition: config.desktopObjectPosition || "56% center",
          mobileObjectPosition: config.mobileObjectPosition || "58% center"
        },
        brochurePath: config.brochurePath,
        floorPlansPdfPath: (config as any).floorPlansPdfPath || config.brochurePath || "/assets/the-bolsover-floorplans.pdf",
        googleMapsUrl: config.googleMapsUrl,
        whatsappMessage: config.whatsappMessage,
        homeHeroPoster: (config as any).homeHeroPoster || "/assets/images/lifestyle-stills/arrival.png",
        filmMainImage: (config as any).filmMainImage || "/assets/images/lifestyle-stills/evening.png",
        architectureImage: (config as any).architectureImage || "/assets/images/building.png",
        apartmentsTeaserImage: (config as any).apartmentsTeaserImage || "/apartments/apartment-living-kitchen.png"
      } : undefined,
      heroData: hero ? {
        eyebrow: hero.eyebrow,
        titleLine1: hero.titleLine1,
        titleLine2: hero.titleLine2,
        introCopy: hero.introCopy
      } : undefined,
      introData: intro ? {
        eyebrow: intro.eyebrow,
        titleLine1: intro.titleLine1,
        titleLine2: intro.titleLine2,
        description: intro.description,
        stat1Value: intro.stat1Value,
        stat1Label: intro.stat1Label,
        stat2Value: intro.stat2Value,
        stat2Label: intro.stat2Label,
        stat3Value: intro.stat3Value,
        stat3Label: intro.stat3Label,
        image: intro.image,
        imageTag: intro.imageTag,
        imageAddress: intro.imageAddress
      } : undefined,
      contactData: contact ? {
        salesEmail: contact.salesEmail,
        salesPhone: contact.salesPhone,
        address: contact.address,
        openingHours: contact.openingHours,
        eyebrow: (contact as any).eyebrow || "Private enquiries",
        title: (contact as any).title || "Register your interest.",
        description: (contact as any).description || "Leave your details and the sales team will be in touch about availability at The Bolsover.",
        consentText: (contact as any).consentText || "I agree to be contacted about The Bolsover and to the handling of my information under the Privacy Policy.",
        submitButtonLabel: (contact as any).submitButtonLabel || "Register interest"
      } : undefined,
      floorLevels: floorLevels,
      privacyPolicy: privacyPolicyRaw ? {
        id: privacyPolicyRaw.id,
        title: privacyPolicyRaw.title,
        effectiveDate: privacyPolicyRaw.effectiveDate,
        published: privacyPolicyRaw.published,
        sections: typeof privacyPolicyRaw.sections === "string" ? JSON.parse(privacyPolicyRaw.sections || "[]") : (privacyPolicyRaw.sections || []),
        updatedAt: privacyPolicyRaw.updatedAt
      } : undefined
    };

    return NextResponse.json({ success: true, data }, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized. Administrator authentication required." }, { status: 401 });
    }

    const payload = await request.json();

    if (payload.heroData) {
      await prisma.heroData.upsert({
        where: { id: "hero_singleton" },
        update: payload.heroData,
        create: { id: "hero_singleton", ...payload.heroData }
      });
    }

    if (payload.introData) {
      await prisma.introData.upsert({
        where: { id: "intro_singleton" },
        update: payload.introData,
        create: { id: "intro_singleton", ...payload.introData }
      });
    }

    if (payload.bolsoverConfig) {
      const cfg = payload.bolsoverConfig;
      const teaserSegs = Array.isArray(cfg.film?.teaserSegments)
        ? JSON.stringify(cfg.film.teaserSegments)
        : (typeof cfg.film?.teaserSegments === "string" ? cfg.film.teaserSegments : "[]");

      const dataToSave = {
        fullSrc: cfg.film?.fullSrc || "",
        teaserSrc: cfg.film?.teaserSrc || "",
        poster: cfg.film?.poster || "",
        brochurePath: cfg.brochurePath || "",
        floorPlansPdfPath: cfg.floorPlansPdfPath || "",
        googleMapsUrl: cfg.googleMapsUrl || "",
        whatsappMessage: cfg.whatsappMessage || "",
        teaserSegments: teaserSegs,
        desktopObjectPosition: cfg.film?.desktopObjectPosition || "56% center",
        mobileObjectPosition: cfg.film?.mobileObjectPosition || "58% center",
        homeHeroPoster: cfg.homeHeroPoster || "/assets/images/lifestyle-stills/arrival.png",
        filmMainImage: cfg.filmMainImage || "/assets/images/lifestyle-stills/arrival.png",
        architectureImage: cfg.architectureImage || "/assets/images/lifestyle-stills/arrival.png",
        apartmentsTeaserImage: cfg.apartmentsTeaserImage || "/apartments/apartment-living-kitchen.png"
      };
      await prisma.bolsoverConfig.upsert({
        where: { id: "config_singleton" },
        update: dataToSave,
        create: { id: "config_singleton", ...dataToSave }
      });
    }

    if (payload.contactData) {
      await prisma.contactData.upsert({
        where: { id: "contact_singleton" },
        update: payload.contactData,
        create: { id: "contact_singleton", ...payload.contactData }
      });
    }

    if (payload.privacyPolicy) {
      const pp = payload.privacyPolicy;
      const sectionsStr = Array.isArray(pp.sections) ? JSON.stringify(pp.sections) : (pp.sections || "[]");
      await prisma.privacyPolicy.upsert({
        where: { id: "privacy_policy" },
        update: {
          title: pp.title || "Privacy Policy",
          effectiveDate: pp.effectiveDate || "29 July 2026",
          published: typeof pp.published === "boolean" ? pp.published : true,
          sections: sectionsStr
        },
        create: {
          id: "privacy_policy",
          title: pp.title || "Privacy Policy",
          effectiveDate: pp.effectiveDate || "29 July 2026",
          published: typeof pp.published === "boolean" ? pp.published : true,
          sections: sectionsStr
        }
      });
    }


    return NextResponse.json({ success: true, message: "Database updated successfully" });
  } catch (error: any) {
    console.error("POST /api/cms internal error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
