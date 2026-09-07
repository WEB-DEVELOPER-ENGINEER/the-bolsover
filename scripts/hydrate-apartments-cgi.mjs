import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filename) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const { PrismaClient } = await import("@prisma/client");
const { supabase } = await import("../src/lib/supabase.ts");

const prisma = new PrismaClient();
const BUCKET = "bolsover-media";
const SOURCE_DIR = path.resolve(process.cwd(), "apartments-cgi");

const CGI_FILES = [
  { file: "Asset 13.png", dest: "apartments-cgi/the-bolsover-concierge-lobby.png", name: "Concierge & Reception Lobby" },
  { file: "Asset 14.png", dest: "apartments-cgi/the-bolsover-apartment-9-bedroom.png", name: "Apartment 9 Master Bedroom" },
  { file: "Asset 15.png", dest: "apartments-cgi/the-bolsover-apartment-9-kitchen.png", name: "Apartment 9 Bespoke Kitchen" },
  { file: "Asset 16.png", dest: "apartments-cgi/the-bolsover-marble-bathroom.png", name: "Principal Marble Bathroom" },
  { file: "Asset 17.png", dest: "apartments-cgi/the-bolsover-living-terrace.png", name: "Living & Dining with Terrace" },
  { file: "Asset 18.png", dest: "apartments-cgi/the-bolsover-open-living-dining.png", name: "Open-Plan Living & Dining Salon" },
  { file: "Asset 20.png", dest: "apartments-cgi/the-bolsover-panoramic-living.png", name: "Panoramic Skyline Living Salon" },
  { file: "Asset 21.png", dest: "apartments-cgi/the-bolsover-apartment-23-grand-living.png", name: "Apartment 23 Grand Vaulted Living Salon" },
  { file: "Asset 22.png", dest: "apartments-cgi/the-bolsover-duplex-staircase-living.png", name: "Split-Level Duplex Staircase & Living" }
];

async function uploadFileToSupabase(storagePath, localFilePath, mimeType) {
  const fileBuffer = fs.readFileSync(localFilePath);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload ${storagePath}: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return urlData.publicUrl;
}

async function run() {
  console.log("=== 1. Uploading apartments-cgi images to Supabase Storage ===");
  const uploadedUrls = {};

  for (const item of CGI_FILES) {
    const localPath = path.join(SOURCE_DIR, item.file);
    if (!fs.existsSync(localPath)) {
      console.error(`Missing file: ${localPath}`);
      continue;
    }

    console.log(`Uploading ${item.file} -> ${item.dest}...`);
    const publicUrl = await uploadFileToSupabase(item.dest, localPath, "image/png");
    uploadedUrls[item.file] = publicUrl;
    console.log(`  Uploaded: ${publicUrl}`);

    // Register in MediaAsset table
    const stat = fs.statSync(localPath);
    await prisma.mediaAsset.upsert({
      where: { url: publicUrl },
      update: {
        filename: path.basename(item.dest),
        originalName: item.file,
        size: stat.size,
        type: "image/png",
        category: "image"
      },
      create: {
        url: publicUrl,
        filename: path.basename(item.dest),
        originalName: item.file,
        size: stat.size,
        type: "image/png",
        category: "image"
      }
    });
  }

  console.log("\n=== 2. Hydrating Apartment Records in Supabase PostgreSQL ===");

  const LOBBY = uploadedUrls["Asset 13.png"];
  const BEDROOM = uploadedUrls["Asset 14.png"];
  const KITCHEN = uploadedUrls["Asset 15.png"];
  const BATHROOM = uploadedUrls["Asset 16.png"];
  const TERRACE = uploadedUrls["Asset 17.png"];
  const OPEN_LIVING = uploadedUrls["Asset 18.png"];
  const PANORAMIC = uploadedUrls["Asset 20.png"];
  const APT23_LIVING = uploadedUrls["Asset 21.png"];
  const DUPLEX = uploadedUrls["Asset 22.png"];

  const FLOOR_PLANS_BASE = "https://jaiybxlzrdnofevtlwrg.supabase.co/storage/v1/object/public/bolsover-media/floor-plans";

  // Fetch all apartments
  const allApartments = await prisma.apartment.findMany({
    orderBy: { number: "asc" }
  });

  for (const apt of allApartments) {
    const aptStr = String(apt.number).padStart(2, "0");
    const planPngUrl = `${FLOOR_PLANS_BASE}/the-bolsover-apartment-${aptStr}.png`;
    const planPdfUrl = `${FLOOR_PLANS_BASE}/the-bolsover-apartment-${aptStr}.pdf`;

    const floorPlanSlide = {
      id: `floorplan-apt-${aptStr}`,
      label: `Architectural Floor Plan`,
      caption: `Dimensioned layout and specification plan for Apartment ${aptStr}.`,
      kind: "image",
      src: planPngUrl,
      url: planPngUrl,
      pdfUrl: planPdfUrl,
      isFloorPlan: true
    };

    let slides = [];

    if (apt.number === 9) {
      // Signature Apartment 09
      slides = [
        {
          id: "apt-9-living",
          label: "Living & Dining Salon",
          caption: "Open-plan living, bespoke dark oak joinery and quiet natural light, composed for everyday life in Fitzrovia.",
          kind: "image",
          src: OPEN_LIVING,
          url: OPEN_LIVING
        },
        {
          id: "apt-9-kitchen",
          label: "Bespoke Kitchen",
          caption: "Custom fluted timber cabinetry with concealed Miele appliances and honed composite stone.",
          kind: "image",
          src: KITCHEN,
          url: KITCHEN
        },
        {
          id: "apt-9-bedroom",
          label: "Master Bedroom Suite",
          caption: "Quiet courtyard aspect with tailored full-height wardrobes and acoustic glazing.",
          kind: "image",
          src: BEDROOM,
          url: BEDROOM
        },
        {
          id: "apt-9-bathroom",
          label: "Principal Marble Bathroom",
          caption: "Floor-to-ceiling Italian porcelain marble tiling with bespoke brassware and radiant underfloor heating.",
          kind: "image",
          src: BATHROOM,
          url: BATHROOM
        },
        floorPlanSlide
      ];
    } else if (apt.number === 23) {
      // Signature Apartment 23 (Lower Ground Grand Residence)
      slides = [
        {
          id: "apt-23-grand-living",
          label: "Vaulted Living Salon",
          caption: "Expansive reception volumes opening directly to private sunken garden lightwells.",
          kind: "image",
          src: APT23_LIVING,
          url: APT23_LIVING
        },
        {
          id: "apt-23-bathroom",
          label: "Principal Marble Bathroom",
          caption: "Spacious master en-suite bathroom with walk-in rainfall shower and twin vanity.",
          kind: "image",
          src: BATHROOM,
          url: BATHROOM
        },
        {
          id: "apt-23-kitchen",
          label: "Bespoke Kitchen",
          caption: "Statement architectural kitchen island with integrated breakfast bar and premium stone.",
          kind: "image",
          src: KITCHEN,
          url: KITCHEN
        },
        floorPlanSlide
      ];
    } else if ([19, 20, 21].includes(apt.number)) {
      // Split-level duplexes
      slides = [
        {
          id: `apt-${aptStr}-duplex`,
          label: "Split-Level Duplex Living",
          caption: "Dramatic two-level architectural volume connected via bespoke internal staircase.",
          kind: "image",
          src: DUPLEX,
          url: DUPLEX
        },
        {
          id: `apt-${aptStr}-terrace`,
          label: "Living & Terrace",
          caption: "Light-filled entertaining zone with direct access to private outdoor space.",
          kind: "image",
          src: TERRACE,
          url: TERRACE
        },
        {
          id: `apt-${aptStr}-kitchen`,
          label: "Bespoke Kitchen",
          caption: "Contemporary kitchen suite with integrated appliances and tailored cabinetry.",
          kind: "image",
          src: KITCHEN,
          url: KITCHEN
        },
        {
          id: `apt-${aptStr}-bathroom`,
          label: "Principal Marble Bathroom",
          caption: "Luxury marble finishes with underfloor heating and rainfall shower.",
          kind: "image",
          src: BATHROOM,
          url: BATHROOM
        },
        floorPlanSlide
      ];
    } else if ([1, 2, 3].includes(apt.number)) {
      // Penthouses
      slides = [
        {
          id: `apt-${aptStr}-panoramic`,
          label: "Panoramic Skyline Living",
          caption: "Top-tier penthouse reception volume capturing panoramic Fitzrovia skyline perspectives.",
          kind: "image",
          src: PANORAMIC,
          url: PANORAMIC
        },
        {
          id: `apt-${aptStr}-bedroom`,
          label: "Master Bedroom Suite",
          caption: "Elevated bedroom sanctuary enjoying high ceilings and bespoke wardrobes.",
          kind: "image",
          src: BEDROOM,
          url: BEDROOM
        },
        {
          id: `apt-${aptStr}-bathroom`,
          label: "Principal Marble Bathroom",
          caption: "Spa-inspired bathroom featuring refined Italian marble finishes and concealed lighting.",
          kind: "image",
          src: BATHROOM,
          url: BATHROOM
        },
        floorPlanSlide
      ];
    } else if ([17, 18].includes(apt.number)) {
      // Ground floor residences
      slides = [
        {
          id: `apt-${aptStr}-entrance`,
          label: "Grand Reception & Living",
          caption: "Distinguished entrance lobby and soaring ground floor reception proportions.",
          kind: "image",
          src: OPEN_LIVING,
          url: OPEN_LIVING
        },
        {
          id: `apt-${aptStr}-lobby`,
          label: "Building Concierge & Lobby",
          caption: "Direct access from the elegant Bolsover Street entrance lobby.",
          kind: "image",
          src: LOBBY,
          url: LOBBY
        },
        {
          id: `apt-${aptStr}-kitchen`,
          label: "Bespoke Kitchen",
          caption: "Gourmet kitchen suite with integrated appliances and stone worktops.",
          kind: "image",
          src: KITCHEN,
          url: KITCHEN
        },
        {
          id: `apt-${aptStr}-bathroom`,
          label: "Principal Marble Bathroom",
          caption: "Italian marble bathroom with heated towel rail and rainfall shower.",
          kind: "image",
          src: BATHROOM,
          url: BATHROOM
        },
        floorPlanSlide
      ];
    } else if ([22, 24, 25].includes(apt.number)) {
      // Lower ground residences
      slides = [
        {
          id: `apt-${aptStr}-living`,
          label: "Secluded Living Salon",
          caption: "Private and peaceful living space with high acoustic tranquility.",
          kind: "image",
          src: OPEN_LIVING,
          url: OPEN_LIVING
        },
        {
          id: `apt-${aptStr}-kitchen`,
          label: "Bespoke Kitchen",
          caption: "Compact luxury kitchen joinery and integrated appliances.",
          kind: "image",
          src: KITCHEN,
          url: KITCHEN
        },
        {
          id: `apt-${aptStr}-bathroom`,
          label: "Principal Marble Bathroom",
          caption: "Contemporary marble bathroom finishes with designer brassware.",
          kind: "image",
          src: BATHROOM,
          url: BATHROOM
        },
        floorPlanSlide
      ];
    } else {
      // Floors 1, 2, 3 (Apartments 4, 5, 6, 7, 8, 10, 11, 12, 14, 15, 16)
      slides = [
        {
          id: `apt-${aptStr}-living`,
          label: "Living & Dining Salon",
          caption: "Generous lateral entertaining space with floor-to-ceiling sash windows and European oak flooring.",
          kind: "image",
          src: OPEN_LIVING,
          url: OPEN_LIVING
        },
        {
          id: `apt-${aptStr}-kitchen`,
          label: "Bespoke Kitchen",
          caption: "Custom fluted cabinetry and integrated Miele appliances.",
          kind: "image",
          src: KITCHEN,
          url: KITCHEN
        },
        {
          id: `apt-${aptStr}-bedroom`,
          label: "Master Bedroom Suite",
          caption: "Serene bedroom sanctuary with tailored joinery and quiet courtyard aspect.",
          kind: "image",
          src: BEDROOM,
          url: BEDROOM
        },
        {
          id: `apt-${aptStr}-bathroom`,
          label: "Principal Marble Bathroom",
          caption: "Italian marble finishes, radiant underfloor heating, and bespoke vanity.",
          kind: "image",
          src: BATHROOM,
          url: BATHROOM
        },
        floorPlanSlide
      ];
    }

    await prisma.apartment.update({
      where: { id: apt.id },
      data: {
        slides: JSON.stringify(slides)
      }
    });

    console.log(`Updated Apartment ${aptStr}: ${slides.length} slides hydrated.`);
  }

  console.log("\n=== Complete! All 24 apartments are hydrated with Supabase Cloud Storage images ===");
}

run()
  .catch((err) => {
    console.error("Hydration failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
