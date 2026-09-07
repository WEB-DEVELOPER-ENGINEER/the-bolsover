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
  {
    number: 1,
    floor: "4",
    giaSqM: "86",
    giaSqFt: "926",
    bedrooms: "3 Bedroom / 5 Person",
    residenceType: "3 Bedroom Penthouse Suite",
    description: "Top-tier penthouse residence featuring soaring ceiling heights, dual-aspect reception volumes, and generous family accommodation in the heart of Fitzrovia.",
    originalPdf: "The-Bolsover_A1.pdf"
  },
  {
    number: 2,
    floor: "4",
    giaSqM: "64",
    giaSqFt: "689",
    bedrooms: "2 Bedroom / 3 Person",
    residenceType: "2 Bedroom Penthouse Suite",
    description: "Quietly refined fourth-floor penthouse with private entrance, bespoke joinery, and private master bedroom sanctuary enjoying elevated skyline vistas.",
    originalPdf: "The-Bolsover_A2.pdf"
  },
  {
    number: 3,
    floor: "4",
    giaSqM: "104",
    giaSqFt: "1,119",
    bedrooms: "4 Bedroom / 8 Person",
    residenceType: "4 Bedroom Grand Penthouse",
    description: "The crown jewel of The Bolsover: an expansive four-bedroom grand penthouse suite with sprawling living, dining, and multi-orientation balconies.",
    originalPdf: "The-Bolsover_A3.pdf"
  },
  {
    number: 4,
    floor: "3",
    giaSqM: "71",
    giaSqFt: "764",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Residence",
    description: "Dual-aspect third-floor corner residence illuminated by classical sash windows, offering tailored dark oak kitchen cabinetry and luxury bathrooms.",
    originalPdf: "The-Bolsover_A4.pdf"
  },
  {
    number: 5,
    floor: "3",
    giaSqM: "69",
    giaSqFt: "743",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Residence",
    description: "Elegant third-floor lateral apartment with open-plan entertainment zone and tranquil internal courtyard outlook.",
    originalPdf: "The-Bolsover_A5.pdf"
  },
  {
    number: 6,
    floor: "3",
    giaSqM: "61",
    giaSqFt: "657",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Residence",
    description: "Intelligently proportioned two-bedroom suite configured for modern living with seamless built-in storage and marble finishes.",
    originalPdf: "The-Bolsover_A6.pdf"
  },
  {
    number: 7,
    floor: "3",
    giaSqM: "66",
    giaSqFt: "710",
    bedrooms: "2 Bedroom / 3 Person",
    residenceType: "2 Bedroom Residence",
    description: "Charming third-floor residence combining Edwardian heritage with contemporary Fitzrovia luxury and calm acoustic isolation.",
    originalPdf: "The-Bolsover_A7.pdf"
  },
  {
    number: 8,
    floor: "2",
    giaSqM: "70",
    giaSqFt: "753",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Residence",
    description: "Grand second-floor apartment with generous reception space, herringbone engineered oak flooring, and custom brass ironmongery.",
    originalPdf: "The-Bolsover_A8.pdf"
  },
  {
    number: 9,
    floor: "2",
    giaSqM: "72",
    giaSqFt: "764",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Residence",
    description: "Open-plan living, bespoke dark oak joinery and quiet natural light, composed for everyday life in Fitzrovia.",
    originalPdf: "The-Bolsover_A9.pdf"
  },
  {
    number: 10,
    floor: "2",
    giaSqM: "63",
    giaSqFt: "678",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Residence",
    description: "Quiet second-floor residence with dual double bedrooms, bespoke wardrobes, and floor-to-ceiling porcelain-tiled bathrooms.",
    originalPdf: "The-Bolsover_A10.pdf"
  },
  {
    number: 11,
    floor: "2",
    giaSqM: "66",
    giaSqFt: "710",
    bedrooms: "2 Bedroom / 3 Person",
    residenceType: "2 Bedroom Residence",
    description: "Light-filled second-floor lateral apartment with generous window lines overlooking Bolsover Street.",
    originalPdf: "The-Bolsover_A11.pdf"
  },
  {
    number: 12,
    floor: "1",
    giaSqM: "70",
    giaSqFt: "753",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Suite",
    description: "First-floor heritage suite with exceptional ceiling heights, restored sash framing, and expansive master bedroom with en-suite.",
    originalPdf: "The-Bolsover_A12.pdf"
  },
  {
    number: 14,
    floor: "1",
    giaSqM: "71",
    giaSqFt: "764",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Suite",
    description: "Distinguished first-floor residence with grand reception volume, concealed chef kitchen, and private dining space.",
    originalPdf: "The-Bolsover_A14.pdf"
  },
  {
    number: 15,
    floor: "1",
    giaSqM: "63",
    giaSqFt: "678",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Suite",
    description: "Sophisticated first-floor suite with period proportions, contemporary minimalist detailing, and peaceful rear elevation.",
    originalPdf: "The-Bolsover_A15.pdf"
  },
  {
    number: 16,
    floor: "1",
    giaSqM: "66",
    giaSqFt: "710",
    bedrooms: "2 Bedroom / 3 Person",
    residenceType: "2 Bedroom Suite",
    description: "Spacious first-floor home with bespoke dark oak wall finishes, integrated appliances, and dual-zone climate comfort.",
    originalPdf: "The-Bolsover_A16.pdf"
  },
  {
    number: 17,
    floor: "G",
    giaSqM: "57",
    giaSqFt: "614",
    bedrooms: "1 Bedroom / 2 Person",
    residenceType: "1 Bedroom Suite",
    description: "Boutique ground-floor one-bedroom apartment featuring direct entrance foyer proximity and calm courtyard garden aspect.",
    originalPdf: "The-Bolsover_A17.pdf"
  },
  {
    number: 18,
    floor: "G",
    giaSqM: "103",
    giaSqFt: "1,109",
    bedrooms: "3 Bedroom / 6 Person",
    residenceType: "3 Bedroom Ground Suite",
    description: "Magnificent ground-floor 3-bedroom residence spanning over 1,100 sq ft with grand private entrance and exceptional living space.",
    originalPdf: "The-Bolsover_A18.pdf"
  },
  {
    number: 19,
    floor: "G/LG",
    giaSqM: "46",
    giaSqFt: "495",
    bedrooms: "1 Bedroom Duplex",
    residenceType: "1 Bedroom Split-Level Duplex",
    description: "Cleverly engineered split-level duplex connecting ground reception to secluded lower level bedroom suite and private lightwell.",
    originalPdf: "Apartment-19-Dims.pdf"
  },
  {
    number: 20,
    floor: "G/LG",
    giaSqM: "89",
    giaSqFt: "958",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Split-Level Duplex",
    description: "Impressive two-storey residence with dramatic architectural staircase, open living room on ground, and two lower ground bedroom suites.",
    originalPdf: "The-Bolsover_A20.pdf"
  },
  {
    number: 21,
    floor: "G/LG",
    giaSqM: "97",
    giaSqFt: "1,044",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Grand Duplex",
    description: "Over 1,040 sq ft of luxurious duplex living featuring dual bathrooms, generous storage, and light-filled sunken patio access.",
    originalPdf: "The-Bolsover_A21.pdf"
  },
  {
    number: 22,
    floor: "LG",
    giaSqM: "63",
    giaSqFt: "678",
    bedrooms: "1 Bedroom / 2 Person",
    residenceType: "1 Bedroom Residence",
    description: "Private lower ground residence offering utmost acoustic tranquility, high ceilings, and tailored contemporary finishes.",
    originalPdf: "The-Bolsover_A22.pdf"
  },
  {
    number: 23,
    floor: "LG",
    giaSqM: "96",
    giaSqFt: "1,033",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Master Residence",
    description: "Expansive 1,033 sq ft lower ground home with sprawling entertaining spaces, custom walk-in wardrobe, and private light patio.",
    originalPdf: "The-Bolsover_A23.pdf"
  },
  {
    number: 24,
    floor: "LG",
    giaSqM: "66",
    giaSqFt: "710",
    bedrooms: "2 Bedroom / 4 Person",
    residenceType: "2 Bedroom Residence",
    description: "Comfortable two-bedroom lower ground apartment designed with subtle ambient lighting and luxury bathrooms.",
    originalPdf: "The-Bolsover_A24.pdf"
  },
  {
    number: 25,
    floor: "LG",
    giaSqM: "40",
    giaSqFt: "431",
    bedrooms: "Studio Space",
    residenceType: "Studio Suite",
    description: "Bespoke studio suite combining high-end compact kitchen joinery, custom fold-away partitions, and serene private seclusion.",
    originalPdf: "The-Bolsover_A25.pdf"
  }
];

const floorLevelsData = [
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
    masterImage: "/assets/floor-plans/the-bolsover-apartment-01.png",
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
    masterImage: "/assets/floor-plans/the-bolsover-apartment-04.png",
    apartmentNumbers: [4, 5, 6, 7]
  },
  {
    floorCode: "2",
    title: "Second Floor Suites",
    subtitle: "Classical Proportions & Bespoke Oak Joinery",
    order: 4,
    levelIndex: 4,
    unitsRange: "Residences 08 – 11",
    residenceCount: 4,
    areaSqFtRange: "678 – 764 sq ft",
    areaSqMRange: "63.0 – 72.0 sq m",
    highlight: "Herringbone oak timber flooring and brushed brass accents",
    description: "Four refined residences combining generous ceiling heights with quiet bedroom sanctuaries and luxury en-suite bathrooms.",
    masterImage: "/assets/floor-plans/the-bolsover-apartment-08.png",
    apartmentNumbers: [8, 9, 10, 11]
  },
  {
    floorCode: "1",
    title: "First Floor Residences",
    subtitle: "Edwardian Aspect & High Ceilings",
    order: 3,
    levelIndex: 3,
    unitsRange: "Residences 12 – 16",
    residenceCount: 4,
    areaSqFtRange: "678 – 764 sq ft",
    areaSqMRange: "63.0 – 71.0 sq m",
    highlight: "Grand ceiling heights reflecting the heritage facade",
    description: "Prestigious first-floor residences featuring preserved period proportioning, bespoke integrated kitchens, and floor-to-ceiling street elevation.",
    masterImage: "/assets/floor-plans/the-bolsover-apartment-12.png",
    apartmentNumbers: [12, 14, 15, 16]
  },
  {
    floorCode: "G",
    title: "Ground Floor Residences",
    subtitle: "Boutique Street Entrance & Private Grand Reception",
    order: 2,
    levelIndex: 2,
    unitsRange: "Residences 17 – 18",
    residenceCount: 2,
    areaSqFtRange: "614 – 1,109 sq ft",
    areaSqMRange: "57.0 – 103.0 sq m",
    highlight: "Immediate private street access and spacious 3-bedroom family proportions",
    description: "Includes an expansive 103 sq m (1,109 sq ft) three-bedroom residence and a charming one-bedroom suite with direct courtyard sightlines.",
    masterImage: "/assets/floor-plans/the-bolsover-apartment-18.png",
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
    masterImage: "/assets/floor-plans/the-bolsover-apartment-20.png",
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
    masterImage: "/assets/floor-plans/the-bolsover-apartment-23.png",
    apartmentNumbers: [22, 23, 24, 25]
  }
];

async function seed() {
  console.log("Starting Floor Plans and Apartments database hydration...");

  // 1. Delete legacy / dummy FloorLevels and recreate with real data
  await prisma.floorLevel.deleteMany({});
  console.log("Cleared old FloorLevel records.");

  // Insert all 7 FloorLevels
  for (const fl of floorLevelsData) {
    const subUnits = fl.apartmentNumbers.map(num => {
      const apt = apartmentData.find(a => a.number === num);
      const aptStr = String(num).padStart(2, "0");
      return {
        id: `subunit_apt_${aptStr}`,
        name: `Apartment ${aptStr}`,
        unitCode: `Apt ${num}`,
        bedrooms: apt?.bedrooms || "Luxury Residence",
        areaSqFt: `${apt?.giaSqFt} sq ft`,
        areaSqM: `${apt?.giaSqM} sq m`,
        image: `/assets/floor-plans/the-bolsover-apartment-${aptStr}.png`,
        pdfUrl: `/assets/floor-plans/the-bolsover-apartment-${aptStr}.pdf`,
        width: 1920,
        height: 1080
      };
    });

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
        masterImage: fl.masterImage,
        width: 1920,
        height: 1080,
        order: fl.order,
        subUnits: JSON.stringify(subUnits)
      }
    });

    console.log(`Created Floor Level ${fl.floorCode}: ${fl.title} (${fl.unitsRange})`);
  }

  // 2. Remove dummy Apartment 13 if present (does not exist)
  await prisma.apartment.deleteMany({ where: { number: 13 } });

  // 3. Upsert all 24 apartments
  for (const apt of apartmentData) {
    const aptStr = String(apt.number).padStart(2, "0");
    const existing = await prisma.apartment.findUnique({ where: { number: apt.number } });

    let slides = [];
    if (existing && existing.slides) {
      try {
        slides = JSON.parse(existing.slides);
      } catch (e) {
        slides = [];
      }
    }

    // Ensure floor plan slide is present
    const planSlideId = `floorplan-apt-${aptStr}`;
    const hasPlanSlide = slides.some(s => s.id === planSlideId || s.label?.includes("Floor Plan"));
    if (!hasPlanSlide) {
      slides.push({
        id: planSlideId,
        label: "Architectural Floor Plan",
        caption: `Architectural Layout — ${apt.bedrooms} (${apt.giaSqFt} sq ft / ${apt.giaSqM} sq m)`,
        kind: "image",
        src: `/assets/floor-plans/the-bolsover-apartment-${aptStr}.png`
      });
    }

    await prisma.apartment.upsert({
      where: { number: apt.number },
      update: {
        label: `Apartment ${aptStr}`,
        residenceType: apt.residenceType,
        area: `${apt.giaSqFt} sq ft (${apt.giaSqM} sq m)`,
        floor: `Floor ${apt.floor}`,
        description: apt.description,
        slides: JSON.stringify(slides),
        order: apt.number
      },
      create: {
        number: apt.number,
        label: `Apartment ${aptStr}`,
        residenceType: apt.residenceType,
        area: `${apt.giaSqFt} sq ft (${apt.giaSqM} sq m)`,
        floor: `Floor ${apt.floor}`,
        description: apt.description,
        slides: JSON.stringify(slides),
        order: apt.number
      }
    });

    console.log(`Synced Apartment ${aptStr}: ${apt.residenceType}`);
  }

  // 4. Register all 24 PDFs and PNGs in MediaAsset
  for (const apt of apartmentData) {
    const aptStr = String(apt.number).padStart(2, "0");
    const pdfPath = `/assets/floor-plans/the-bolsover-apartment-${aptStr}.pdf`;
    const pngPath = `/assets/floor-plans/the-bolsover-apartment-${aptStr}.png`;

    await prisma.mediaAsset.upsert({
      where: { url: pdfPath },
      update: {
        filename: `the-bolsover-apartment-${aptStr}.pdf`,
        originalName: apt.originalPdf,
        category: "document",
        type: "application/pdf"
      },
      create: {
        url: pdfPath,
        filename: `the-bolsover-apartment-${aptStr}.pdf`,
        originalName: apt.originalPdf,
        size: 300000,
        type: "application/pdf",
        category: "document"
      }
    });

    await prisma.mediaAsset.upsert({
      where: { url: pngPath },
      update: {
        filename: `the-bolsover-apartment-${aptStr}.png`,
        originalName: `the-bolsover-apartment-${aptStr}.png`,
        category: "image",
        type: "image/png"
      },
      create: {
        url: pngPath,
        filename: `the-bolsover-apartment-${aptStr}.png`,
        originalName: `the-bolsover-apartment-${aptStr}.png`,
        size: 1500000,
        type: "image/png",
        category: "image"
      }
    });
  }

  console.log("Floor Plans & Apartments seeding completed successfully!");
}

seed()
  .catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
