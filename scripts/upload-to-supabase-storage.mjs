import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// 1. Load env
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

const SOURCE_DIR = "/home/momo/Downloads/wetransfer_the-bolsover_a18-pdf_2026-08-20_1546";
const TMP_DIR = "/tmp/bolsover-supabase-upload";
const BUCKET = "bolsover-media";

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// 24 apartments mapping
const apartmentData = [
  { number: 1, floor: "4", giaSqM: "86", giaSqFt: "926", bedrooms: "3 Bedroom / 5 Person", residenceType: "3 Bedroom Penthouse Suite", description: "Top-tier penthouse residence featuring soaring ceiling heights, dual-aspect reception volumes, and generous family accommodation in the heart of Fitzrovia.", originalPdf: "The-Bolsover_A1.pdf" },
  { number: 2, floor: "4", giaSqM: "64", giaSqFt: "689", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Penthouse Suite", description: "Quietly refined fourth-floor penthouse with private entrance, bespoke joinery, and private master bedroom sanctuary enjoying elevated skyline vistas.", originalPdf: "The-Bolsover_A2.pdf" },
  { number: 3, floor: "4", giaSqM: "104", giaSqFt: "1,119", bedrooms: "4 Bedroom / 8 Person", residenceType: "4 Bedroom Grand Penthouse", description: "The crown jewel of The Bolsover: an expansive four-bedroom grand penthouse suite with sprawling living, dining, and multi-orientation balconies.", originalPdf: "The-Bolsover_A3.pdf" },
  { number: 4, floor: "3", giaSqM: "70", giaSqFt: "753", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Luxury Suite", description: "Generously scaled third-floor suite featuring expansive open-concept living and floor-to-ceiling sash windows capturing tranquil Bolsover Street perspectives.", originalPdf: "The-Bolsover_A4.pdf" },
  { number: 5, floor: "3", giaSqM: "61", giaSqFt: "657", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Luxury Residence", description: "Impeccably balanced two-bedroom residence centered around a gourmet kitchen, integrated appliances, and peaceful master sanctuary.", originalPdf: "The-Bolsover_A5.pdf" },
  { number: 6, floor: "3", giaSqM: "71", giaSqFt: "764", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Luxury Residence", description: "Bright and light-filled third-floor residence boasting bespoke European oak flooring, marble bathroom finishes, and generous built-in storage.", originalPdf: "The-Bolsover_A6.pdf" },
  { number: 7, floor: "3", giaSqM: "63", giaSqFt: "678", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Luxury Residence", description: "Elegantly proportioned two-bedroom suite with discrete entrance lobby, guest powder room, and private bedroom wing.", originalPdf: "The-Bolsover_A7.pdf" },
  { number: 8, floor: "2", giaSqM: "69", giaSqFt: "743", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Classic Residence", description: "Spacious second-floor apartment with fluid entertaining spaces, high acoustic insulation, and tailored lighting design throughout.", originalPdf: "The-Bolsover_A8.pdf" },
  { number: 9, floor: "2", giaSqM: "62", giaSqFt: "667", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Classic Residence", description: "Intelligent lateral layout featuring bespoke recessed joinery, ensuite master shower room, and sunlit morning salon.", originalPdf: "The-Bolsover_A9.pdf" },
  { number: 10, floor: "2", giaSqM: "71", giaSqFt: "764", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Classic Residence", description: "Sophisticated second-floor living offering oversized reception room, custom architectural bronze accents, and stone worktops.", originalPdf: "The-Bolsover_A10.pdf" },
  { number: 11, floor: "2", giaSqM: "63", giaSqFt: "678", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Classic Residence", description: "Peacefully positioned corner apartment with dual aspects, tailored bedroom wardrobes, and spa-inspired primary bathroom.", originalPdf: "The-Bolsover_A11.pdf" },
  { number: 12, floor: "1", giaSqM: "69", giaSqFt: "743", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Garden-View Residence", description: "First-floor grand residence with high ceilings, large sash fenestration overlooking tree-lined streetscapes, and separate chef's island.", originalPdf: "The-Bolsover_A12.pdf" },
  { number: 14, floor: "1", giaSqM: "62", giaSqFt: "667", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Heritage Suite", description: "Refined first-floor residence blending Fitzrovia heritage architectural character with ultra-contemporary finishes and underfloor heating.", originalPdf: "The-Bolsover_A14.pdf" },
  { number: 15, floor: "1", giaSqM: "71", giaSqFt: "764", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Heritage Suite", description: "Substantial two-bedroom home designed for elevated London living with spacious open dining and custom Italian joinery.", originalPdf: "The-Bolsover_A15.pdf" },
  { number: 16, floor: "1", giaSqM: "63", giaSqFt: "678", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Heritage Suite", description: "Serene first-floor accommodation featuring dual bedroom suites, custom vanity units, and low-energy climate control.", originalPdf: "The-Bolsover_A16.pdf" },
  { number: 17, floor: "G", giaSqM: "69", giaSqFt: "743", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Ground Residence", description: "Distinguished ground-floor residence providing effortless street-level access, soaring entrance proportions, and acoustic privacy.", originalPdf: "The-Bolsover_A17.pdf" },
  { number: 18, floor: "G", giaSqM: "71", giaSqFt: "764", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Ground Residence", description: "Flagship ground-floor residence showcasing expansive primary bedroom suite, private dressing hall, and statement entertaining space.", originalPdf: "The-Bolsover_A18.pdf" },
  { number: 19, floor: "G/LG", giaSqM: "46", giaSqFt: "495", bedrooms: "1 Bedroom Duplex", residenceType: "1 Bedroom Split-Level Duplex", description: "Cleverly engineered split-level duplex connecting ground reception to secluded lower level bedroom suite and private lightwell.", originalPdf: "Apartment-19-Dims.pdf" },
  { number: 20, floor: "G/LG", giaSqM: "89", giaSqFt: "958", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Split-Level Duplex", description: "Impressive two-storey residence with dramatic architectural staircase, open living room on ground, and two lower ground bedroom suites.", originalPdf: "The-Bolsover_A20.pdf" },
  { number: 21, floor: "G/LG", giaSqM: "97", giaSqFt: "1,044", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Grand Duplex", description: "Over 1,040 sq ft of luxurious duplex living featuring dual bathrooms, generous storage, and light-filled sunken patio access.", originalPdf: "The-Bolsover_A21.pdf" },
  { number: 22, floor: "LG", giaSqM: "63", giaSqFt: "678", bedrooms: "1 Bedroom / 2 Person", residenceType: "1 Bedroom Residence", description: "Private lower ground residence offering utmost acoustic tranquility, high ceilings, and tailored contemporary finishes.", originalPdf: "The-Bolsover_A22.pdf" },
  { number: 23, floor: "LG", giaSqM: "96", giaSqFt: "1,033", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Master Residence", description: "Expansive 1,033 sq ft lower ground home with sprawling entertaining spaces, custom walk-in wardrobe, and private light patio.", originalPdf: "The-Bolsover_A23.pdf" },
  { number: 24, floor: "LG", giaSqM: "66", giaSqFt: "710", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Residence", description: "Comfortable two-bedroom lower ground apartment designed with subtle ambient lighting and luxury bathrooms.", originalPdf: "The-Bolsover_A24.pdf" },
  { number: 25, floor: "LG", giaSqM: "40", giaSqFt: "431", bedrooms: "Studio Space", residenceType: "Studio Suite", description: "Bespoke studio suite combining high-end compact kitchen joinery, custom fold-away partitions, and serene private seclusion.", originalPdf: "The-Bolsover_A25.pdf" }
];

const floorLevelsConfig = [
  {
    floorCode: "4",
    title: "Fourth Floor Residences",
    subtitle: "Top-Tier Penthouses & Expansive Terraces",
    order: 6,
    levelIndex: 6,
    unitsRange: "Residences 01 – 03",
    residenceCount: 3,
    areaSqFtRange: "689 – 1,119 sq ft",
    areaSqMRange: "64.0 – 104.0 sq m",
    highlight: "Dual-aspect reception volumes & elevated Fitzrovia city views",
    description: "The penthouse tier features three private residences with soaring ceilings, multi-aspect terrace views, and master bedroom dressing suites.",
    masterApt: 1,
    apartmentNumbers: [1, 2, 3]
  },
  {
    floorCode: "3",
    title: "Third Floor Suites",
    subtitle: "Dual-Aspect Living & Generous Proportions",
    order: 5,
    levelIndex: 5,
    unitsRange: "Residences 04 – 07",
    residenceCount: 4,
    areaSqFtRange: "657 – 764 sq ft",
    areaSqMRange: "61.0 – 71.0 sq m",
    highlight: "Abundant natural light through elegant sash fenestration",
    description: "A curated selection of two-bedroom suites with open-plan kitchen and dining zones, bespoke cabinetry, and tranquil rear bedroom orientations.",
    masterApt: 4,
    apartmentNumbers: [4, 5, 6, 7]
  },
  {
    floorCode: "2",
    title: "Second Floor Residences",
    subtitle: "Refined Lateral Living & Tailored Joinery",
    order: 4,
    levelIndex: 4,
    unitsRange: "Residences 08 – 11",
    residenceCount: 4,
    areaSqFtRange: "667 – 764 sq ft",
    areaSqMRange: "62.0 – 71.0 sq m",
    highlight: "Generous lateral living spaces with acoustic privacy",
    description: "Four impeccably designed apartments offering refined bedroom suites, chevron timber floors, and marble-clad principal bathrooms.",
    masterApt: 8,
    apartmentNumbers: [8, 9, 10, 11]
  },
  {
    floorCode: "1",
    title: "First Floor Suites",
    subtitle: "Graceful Proportions & Classical Fenestration",
    order: 3,
    levelIndex: 3,
    unitsRange: "Residences 12, 14 – 16",
    residenceCount: 4,
    areaSqFtRange: "667 – 764 sq ft",
    areaSqMRange: "62.0 – 71.0 sq m",
    highlight: "High ceilings and classical street views",
    description: "Distinguished by superior ceiling volume, tall sash windows framing quiet streetscapes, and bespoke contemporary kitchen suites.",
    masterApt: 12,
    apartmentNumbers: [12, 14, 15, 16]
  },
  {
    floorCode: "G",
    title: "Ground Floor Residences",
    subtitle: "Direct Access Living & Private Street Level Distinction",
    order: 2,
    levelIndex: 2,
    unitsRange: "Residences 17 & 18",
    residenceCount: 2,
    areaSqFtRange: "743 – 764 sq ft",
    areaSqMRange: "69.0 – 71.0 sq m",
    highlight: "Effortless ground floor entrance with expansive lateral entertaining",
    description: "Two prime ground-level residences offering seamless building access, stately entrance lobbies, and generous master suites.",
    masterApt: 18,
    apartmentNumbers: [17, 18]
  },
  {
    floorCode: "G/LG",
    title: "Ground & Lower Ground Duplexes",
    subtitle: "Two-Level Architectural Living & Private Courtyard Lightwells",
    order: 1,
    levelIndex: 1,
    unitsRange: "Residences 19 – 21",
    residenceCount: 3,
    areaSqFtRange: "495 – 1,044 sq ft",
    areaSqMRange: "46.0 – 97.0 sq m",
    highlight: "Multi-level spatial separation with internal private staircases",
    description: "Exceptional split-level duplexes combining living/entertaining on the ground tier with private restful bedroom sanctuaries on the lower ground floor.",
    masterApt: 20,
    apartmentNumbers: [19, 20, 21]
  },
  {
    floorCode: "LG",
    title: "Lower Ground Residences",
    subtitle: "Quiet Seclusion, Studio Space & Bespoke Finishes",
    order: 0,
    levelIndex: 0,
    unitsRange: "Residences 22 – 25",
    residenceCount: 4,
    areaSqFtRange: "431 – 1,033 sq ft",
    areaSqMRange: "40.0 – 96.0 sq m",
    highlight: "Serene sunken garden privacy and secluded contemporary layouts",
    description: "Features an intimate studio residence and expansive 1 & 2 bedroom homes bathed in diffused light from private lightwells.",
    masterApt: 23,
    apartmentNumbers: [22, 23, 24, 25]
  }
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
  console.log("=== Starting Migration to Supabase Cloud Storage ===");
  console.log(`Source folder: ${SOURCE_DIR}`);
  console.log(`Target Supabase bucket: ${BUCKET}`);

  // 1. Process all 24 apartments
  const aptUrls = {};

  for (const apt of apartmentData) {
    const aptStr = String(apt.number).padStart(2, "0");
    console.log(`Processing Apt ${aptStr} (${apt.originalPdf})...`);

    const srcPdf = path.join(SOURCE_DIR, apt.originalPdf);
    if (!fs.existsSync(srcPdf)) {
      console.error(`ERROR: Missing source PDF: ${srcPdf}`);
      continue;
    }

    // A. Upload PDF directly to Supabase Storage
    const pdfStoragePath = `floor-plans/the-bolsover-apartment-${aptStr}.pdf`;
    const pdfUrl = await uploadFileToSupabase(pdfStoragePath, srcPdf, "application/pdf");
    console.log(`  Uploaded PDF -> ${pdfUrl}`);

    // B. Render PDF page 1 to high-resolution PNG using pdftoppm
    const tmpPngPrefix = path.join(TMP_DIR, `apt-${aptStr}`);
    execSync(`pdftoppm -png -r 250 -f 1 -l 1 "${srcPdf}" "${tmpPngPrefix}"`);
    const generatedPng = `${tmpPngPrefix}-1.png`;

    // C. Optimize and trim border to clean image
    const finalPng = path.join(TMP_DIR, `the-bolsover-apartment-${aptStr}.png`);
    execSync(`convert "${generatedPng}" -trim +repage -bordercolor white -border 30 "${finalPng}"`);

    // D. Upload PNG to Supabase Storage
    const pngStoragePath = `floor-plans/the-bolsover-apartment-${aptStr}.png`;
    const pngUrl = await uploadFileToSupabase(pngStoragePath, finalPng, "image/png");
    console.log(`  Uploaded PNG -> ${pngUrl}`);

    aptUrls[apt.number] = { pdfUrl, pngUrl };

    // Register MediaAssets in PostgreSQL
    const pdfStat = fs.statSync(srcPdf);
    const pngStat = fs.statSync(finalPng);

    await prisma.mediaAsset.upsert({
      where: { url: pdfUrl },
      update: {
        filename: `the-bolsover-apartment-${aptStr}.pdf`,
        originalName: apt.originalPdf,
        size: pdfStat.size,
        type: "application/pdf",
        category: "document"
      },
      create: {
        url: pdfUrl,
        filename: `the-bolsover-apartment-${aptStr}.pdf`,
        originalName: apt.originalPdf,
        size: pdfStat.size,
        type: "application/pdf",
        category: "document"
      }
    });

    await prisma.mediaAsset.upsert({
      where: { url: pngUrl },
      update: {
        filename: `the-bolsover-apartment-${aptStr}.png`,
        originalName: `Apartment ${aptStr} Architectural Plan`,
        size: pngStat.size,
        type: "image/png",
        category: "image"
      },
      create: {
        url: pngUrl,
        filename: `the-bolsover-apartment-${aptStr}.png`,
        originalName: `Apartment ${aptStr} Architectural Plan`,
        size: pngStat.size,
        type: "image/png",
        category: "image"
      }
    });
  }

  // 2. Also handle The-Bolsover_A18.jpg
  const jpg18Src = path.join(SOURCE_DIR, "The-Bolsover_A18.jpg");
  if (fs.existsSync(jpg18Src)) {
    const jpgUrl = await uploadFileToSupabase("floor-plans/the-bolsover-apartment-18.jpg", jpg18Src, "image/jpeg");
    console.log(`  Uploaded A18 JPG -> ${jpgUrl}`);
  }

  // 3. Hydrate FloorLevel table with Supabase URLs
  console.log("Updating FloorLevel records in PostgreSQL with Supabase Storage URLs...");
  await prisma.floorLevel.deleteMany({});

  for (const fl of floorLevelsConfig) {
    const subUnits = fl.apartmentNumbers.map(num => {
      const apt = apartmentData.find(a => a.number === num);
      const aptStr = String(num).padStart(2, "0");
      const urls = aptUrls[num];
      return {
        id: `subunit_apt_${aptStr}`,
        name: `Apartment ${aptStr}`,
        unitCode: `Apt ${num}`,
        bedrooms: apt?.bedrooms || "Luxury Residence",
        areaSqFt: `${apt?.giaSqFt} sq ft`,
        areaSqM: `${apt?.giaSqM} sq m`,
        image: urls?.pngUrl || "",
        pdfUrl: urls?.pdfUrl || "",
        width: 1920,
        height: 1080
      };
    });

    const masterUrls = aptUrls[fl.masterApt];

    await prisma.floorLevel.create({
      data: {
        floorCode: fl.floorCode,
        title: fl.title,
        subtitle: fl.subtitle,
        levelIndex: fl.levelIndex,
        unitsRange: fl.unitsRange,
        residenceCount: fl.residenceCount,
        areaSqFtRange: fl.areaSqFtRange,
        areaSqMRange: fl.areaSqMRange,
        highlight: fl.highlight,
        description: fl.description,
        masterImage: masterUrls?.pngUrl || "",
        width: 1920,
        height: 1080,
        order: fl.order,
        subUnits: JSON.stringify(subUnits)
      }
    });

    console.log(`  Updated Floor Level ${fl.floorCode} with Supabase URLs.`);
  }

  // 4. Update Apartment records with Supabase URLs
  console.log("Updating Apartment records in PostgreSQL...");
  await prisma.apartment.deleteMany({ where: { number: 13 } });

  for (const apt of apartmentData) {
    const aptStr = String(apt.number).padStart(2, "0");
    const urls = aptUrls[apt.number];

    const existing = await prisma.apartment.findUnique({ where: { number: apt.number } });
    let slides = [];
    if (existing && existing.slides) {
      try { slides = JSON.parse(existing.slides); } catch (e) { slides = []; }
    }

    const planSlideId = `floorplan-apt-${aptStr}`;
    slides = slides.filter(s => s.id !== planSlideId && !s.label?.includes("Floor Plan"));
    slides.push({
      id: planSlideId,
      label: `Apartment ${aptStr} Floor Plan`,
      url: urls?.pngUrl || "",
      pdfUrl: urls?.pdfUrl || "",
      isFloorPlan: true
    });

    await prisma.apartment.upsert({
      where: { number: apt.number },
      update: {
        floor: apt.floor,
        areaSqM: apt.giaSqM,
        areaSqFt: apt.giaSqFt,
        bedrooms: apt.bedrooms,
        residenceType: apt.residenceType,
        description: apt.description,
        floorPlanPdf: urls?.pdfUrl || "",
        floorPlanImage: urls?.pngUrl || "",
        slides: JSON.stringify(slides)
      },
      create: {
        number: apt.number,
        title: `Apartment ${aptStr}`,
        unitCode: `Apt ${apt.number}`,
        floor: apt.floor,
        areaSqM: apt.giaSqM,
        areaSqFt: apt.giaSqFt,
        bedrooms: apt.bedrooms,
        residenceType: apt.residenceType,
        description: apt.description,
        heroImage: urls?.pngUrl || "",
        floorPlanPdf: urls?.pdfUrl || "",
        floorPlanImage: urls?.pngUrl || "",
        slides: JSON.stringify(slides)
      }
    });
  }

  // 5. Clean up temporary files
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  console.log("=== Successfully Migrated All Floor Plans to Supabase Cloud Storage! ===");
}

run()
  .catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
