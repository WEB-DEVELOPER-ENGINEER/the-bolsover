export interface SubUnitPlan {
  id: string;
  name: string;
  unitCode: string;
  bedrooms: string;
  areaSqFt: string;
  areaSqM: string;
  image: string;
  width: number;
  height: number;
}

export interface FloorLevelData {
  id: string;
  floorCode: string;
  title: string;
  subtitle: string;
  levelIndex: number;
  order?: number;
  unitsRange: string;
  residenceCount: number;
  areaSqFtRange: string;
  areaSqMRange: string;
  highlight: string;
  description: string;
  masterImage: string;
  width: number;
  height: number;
  subUnits: SubUnitPlan[];
}

export const defaultFloorLevels: FloorLevelData[] = [
  {
    id: "fl_ground",
    floorCode: "G",
    title: "Ground Floor Residences",
    subtitle: "Street Level Access & Private Courtyard",
    levelIndex: 0,
    order: 0,
    unitsRange: "Residences 01 – 04",
    residenceCount: 4,
    areaSqFtRange: "485 – 1,120 sq ft",
    areaSqMRange: "45.1 – 104.0 sq m",
    highlight: "Double-height reception volumes & direct garden entrance",
    description: "Features four boutique studio and one-bedroom duplex suites with hand-selected marbles and bespoke oak joinery.",
    masterImage: "https://meshoiyjbcacrlvdaoov.supabase.co/storage/v1/object/public/bolsover-media/floor-plans/ground/master-plan.png",
    width: 1000,
    height: 700,
    subUnits: [
      {
        id: "unit_g01",
        name: "Apartment G.01",
        unitCode: "G01",
        bedrooms: "1 Bedroom Duplex",
        areaSqFt: "820 sq ft",
        areaSqM: "76.2 sq m",
        image: "https://meshoiyjbcacrlvdaoov.supabase.co/storage/v1/object/public/bolsover-media/floor-plans/ground/master-plan.png",
        width: 1000,
        height: 700
      },
      {
        id: "unit_g02",
        name: "Apartment G.02",
        unitCode: "G02",
        bedrooms: "Studio Suite",
        areaSqFt: "485 sq ft",
        areaSqM: "45.1 sq m",
        image: "https://meshoiyjbcacrlvdaoov.supabase.co/storage/v1/object/public/bolsover-media/floor-plans/ground/master-plan.png",
        width: 1000,
        height: 700
      }
    ]
  },
  {
    id: "fl_first",
    floorCode: "1",
    title: "First Floor Suites",
    subtitle: "Edwardian Aspect & High Ceilings",
    levelIndex: 1,
    order: 1,
    unitsRange: "Residences 05 – 09",
    residenceCount: 5,
    areaSqFtRange: "540 – 1,350 sq ft",
    areaSqMRange: "50.2 – 125.4 sq m",
    highlight: "Restored Edwardian sash windows & herringbone oak flooring",
    description: "Elegant 1, 2 and 3 bedroom residences enjoying floor-to-ceiling street elevation and dual-aspect living rooms.",
    masterImage: "https://meshoiyjbcacrlvdaoov.supabase.co/storage/v1/object/public/bolsover-media/floor-plans/ground/master-plan.png",
    width: 1000,
    height: 700,
    subUnits: [
      {
        id: "unit_101",
        name: "Apartment 1.01",
        unitCode: "101",
        bedrooms: "2 Bedrooms",
        areaSqFt: "1,120 sq ft",
        areaSqM: "104.0 sq m",
        image: "https://meshoiyjbcacrlvdaoov.supabase.co/storage/v1/object/public/bolsover-media/floor-plans/ground/master-plan.png",
        width: 1000,
        height: 700
      }
    ]
  },
  {
    id: "fl_penthouse",
    floorCode: "PH",
    title: "Penthouse Crown",
    subtitle: "Private Panoramic Terrace",
    levelIndex: 2,
    order: 2,
    unitsRange: "Penthouse Suite",
    residenceCount: 1,
    areaSqFtRange: "2,450 sq ft",
    areaSqMRange: "227.6 sq m",
    highlight: "360° West End skyline views & private roof terrace",
    description: "The pinnacle of Fitzrovia living featuring four bedroom suites, private direct lift access, and wraparound outdoor entertaining space.",
    masterImage: "https://meshoiyjbcacrlvdaoov.supabase.co/storage/v1/object/public/bolsover-media/floor-plans/ground/master-plan.png",
    width: 1000,
    height: 700,
    subUnits: [
      {
        id: "unit_ph01",
        name: "The Bolsover Penthouse",
        unitCode: "PH01",
        bedrooms: "4 Bedrooms & Sky Terrace",
        areaSqFt: "2,450 sq ft",
        areaSqM: "227.6 sq m",
        image: "https://meshoiyjbcacrlvdaoov.supabase.co/storage/v1/object/public/bolsover-media/floor-plans/ground/master-plan.png",
        width: 1000,
        height: 700
      }
    ]
  }
];

