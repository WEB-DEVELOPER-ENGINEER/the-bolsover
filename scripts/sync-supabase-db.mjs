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
const prisma = new PrismaClient();

const apartmentData = [
  { number: 1, floor: "4", giaSqM: "86", giaSqFt: "926", bedrooms: "3 Bedroom / 5 Person", residenceType: "3 Bedroom Penthouse Suite", description: "Top-tier penthouse residence featuring soaring ceiling heights, dual-aspect reception volumes, and generous family accommodation in the heart of Fitzrovia." },
  { number: 2, floor: "4", giaSqM: "64", giaSqFt: "689", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Penthouse Suite", description: "Quietly refined fourth-floor penthouse with private entrance, bespoke joinery, and private master bedroom sanctuary enjoying elevated skyline vistas." },
  { number: 3, floor: "4", giaSqM: "104", giaSqFt: "1,119", bedrooms: "4 Bedroom / 8 Person", residenceType: "4 Bedroom Grand Penthouse", description: "The crown jewel of The Bolsover: an expansive four-bedroom grand penthouse suite with sprawling living, dining, and multi-orientation balconies." },
  { number: 4, floor: "3", giaSqM: "70", giaSqFt: "753", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Luxury Suite", description: "Generously scaled third-floor suite featuring expansive open-concept living and floor-to-ceiling sash windows capturing tranquil Bolsover Street perspectives." },
  { number: 5, floor: "3", giaSqM: "61", giaSqFt: "657", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Luxury Residence", description: "Impeccably balanced two-bedroom residence centered around a gourmet kitchen, integrated appliances, and peaceful master sanctuary." },
  { number: 6, floor: "3", giaSqM: "71", giaSqFt: "764", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Luxury Residence", description: "Bright and light-filled third-floor residence boasting bespoke European oak flooring, marble bathroom finishes, and generous built-in storage." },
  { number: 7, floor: "3", giaSqM: "63", giaSqFt: "678", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Luxury Residence", description: "Elegantly proportioned two-bedroom suite with discrete entrance lobby, guest powder room, and private bedroom wing." },
  { number: 8, floor: "2", giaSqM: "69", giaSqFt: "743", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Classic Residence", description: "Spacious second-floor apartment with fluid entertaining spaces, high acoustic insulation, and tailored lighting design throughout." },
  { number: 9, floor: "2", giaSqM: "62", giaSqFt: "667", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Classic Residence", description: "Intelligent lateral layout featuring bespoke recessed joinery, ensuite master shower room, and sunlit morning salon." },
  { number: 10, floor: "2", giaSqM: "71", giaSqFt: "764", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Classic Residence", description: "Sophisticated second-floor living offering oversized reception room, custom architectural bronze accents, and stone worktops." },
  { number: 11, floor: "2", giaSqM: "63", giaSqFt: "678", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Classic Residence", description: "Peacefully positioned corner apartment with dual aspects, tailored bedroom wardrobes, and spa-inspired primary bathroom." },
  { number: 12, floor: "1", giaSqM: "69", giaSqFt: "743", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Garden-View Residence", description: "First-floor grand residence with high ceilings, large sash fenestration overlooking tree-lined streetscapes, and separate chef's island." },
  { number: 14, floor: "1", giaSqM: "62", giaSqFt: "667", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Heritage Suite", description: "Refined first-floor residence blending Fitzrovia heritage architectural character with ultra-contemporary finishes and underfloor heating." },
  { number: 15, floor: "1", giaSqM: "71", giaSqFt: "764", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Heritage Suite", description: "Substantial two-bedroom home designed for elevated London living with spacious open dining and custom Italian joinery." },
  { number: 16, floor: "1", giaSqM: "63", giaSqFt: "678", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Heritage Suite", description: "Serene first-floor accommodation featuring dual bedroom suites, custom vanity units, and low-energy climate control." },
  { number: 17, floor: "G", giaSqM: "69", giaSqFt: "743", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Ground Residence", description: "Distinguished ground-floor residence providing effortless street-level access, soaring entrance proportions, and acoustic privacy." },
  { number: 18, floor: "G", giaSqM: "71", giaSqFt: "764", bedrooms: "2 Bedroom / 3 Person", residenceType: "2 Bedroom Ground Residence", description: "Flagship ground-floor residence showcasing expansive primary bedroom suite, private dressing hall, and statement entertaining space." },
  { number: 19, floor: "G/LG", giaSqM: "46", giaSqFt: "495", bedrooms: "1 Bedroom Duplex", residenceType: "1 Bedroom Split-Level Duplex", description: "Cleverly engineered split-level duplex connecting ground reception to secluded lower level bedroom suite and private lightwell." },
  { number: 20, floor: "G/LG", giaSqM: "89", giaSqFt: "958", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Split-Level Duplex", description: "Impressive two-storey residence with dramatic architectural staircase, open living room on ground, and two lower ground bedroom suites." },
  { number: 21, floor: "G/LG", giaSqM: "97", giaSqFt: "1,044", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Grand Duplex", description: "Over 1,040 sq ft of luxurious duplex living featuring dual bathrooms, generous storage, and light-filled sunken patio access." },
  { number: 22, floor: "LG", giaSqM: "63", giaSqFt: "678", bedrooms: "1 Bedroom / 2 Person", residenceType: "1 Bedroom Residence", description: "Private lower ground residence offering utmost acoustic tranquility, high ceilings, and tailored contemporary finishes." },
  { number: 23, floor: "LG", giaSqM: "96", giaSqFt: "1,033", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Master Residence", description: "Expansive 1,033 sq ft lower ground home with sprawling entertaining spaces, custom walk-in wardrobe, and private light patio." },
  { number: 24, floor: "LG", giaSqM: "66", giaSqFt: "710", bedrooms: "2 Bedroom / 4 Person", residenceType: "2 Bedroom Residence", description: "Comfortable two-bedroom lower ground apartment designed with subtle ambient lighting and luxury bathrooms." },
  { number: 25, floor: "LG", giaSqM: "40", giaSqFt: "431", bedrooms: "Studio Space", residenceType: "Studio Suite", description: "Bespoke studio suite combining high-end compact kitchen joinery, custom fold-away partitions, and serene private seclusion." }
];

const SUPABASE_BASE_URL = "https://jaiybxlzrdnofevtlwrg.supabase.co/storage/v1/object/public/bolsover-media/floor-plans";

async function main() {
  console.log("Syncing Apartment records with Supabase URLs...");
  await prisma.apartment.deleteMany({ where: { number: 13 } });

  for (const apt of apartmentData) {
    const aptStr = String(apt.number).padStart(2, "0");
    const pdfUrl = `${SUPABASE_BASE_URL}/the-bolsover-apartment-${aptStr}.pdf`;
    const pngUrl = `${SUPABASE_BASE_URL}/the-bolsover-apartment-${aptStr}.png`;

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
      url: pngUrl,
      pdfUrl: pdfUrl,
      isFloorPlan: true
    });

    await prisma.apartment.upsert({
      where: { number: apt.number },
      update: {
        label: `Apartment ${aptStr}`,
        floor: apt.floor,
        area: `${apt.giaSqFt} sq ft (${apt.giaSqM} sq m)`,
        residenceType: apt.residenceType,
        description: apt.description,
        slides: JSON.stringify(slides)
      },
      create: {
        number: apt.number,
        label: `Apartment ${aptStr}`,
        floor: apt.floor,
        area: `${apt.giaSqFt} sq ft (${apt.giaSqM} sq m)`,
        residenceType: apt.residenceType,
        description: apt.description,
        slides: JSON.stringify(slides),
        order: apt.number
      }
    });

    console.log(`Synced Apartment ${aptStr}`);
  }

  // Remove redundant local folders
  const localUploadsPlans = path.resolve(process.cwd(), "public/uploads/floor-plans");
  const localAssetsPlans = path.resolve(process.cwd(), "public/assets/floor-plans");
  if (fs.existsSync(localUploadsPlans)) {
    fs.rmSync(localUploadsPlans, { recursive: true, force: true });
    console.log("Removed redundant public/uploads/floor-plans");
  }
  if (fs.existsSync(localAssetsPlans)) {
    fs.rmSync(localAssetsPlans, { recursive: true, force: true });
    console.log("Removed redundant public/assets/floor-plans");
  }

  console.log("All apartments and floor levels are 100% in Supabase cloud!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
