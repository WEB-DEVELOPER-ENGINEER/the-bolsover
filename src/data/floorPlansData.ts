export interface SubUnitPlan {
  id: string;
  name: string;
  unitCode: string;
  bedrooms: string;
  areaSqFt: string;
  areaSqM: string;
  image: string;
  pdfUrl?: string;
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

export const defaultFloorLevels: FloorLevelData[] = [];
