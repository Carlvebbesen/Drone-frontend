export interface BuildingObject {
  poiId: number;
  kind: string;
  nodeId?: any;
  geometry: Geometry;
  point: Point;
  campusId: number;
  floorId?: any;
  floorName?: any;
  buildingId: number;
  buildingName: string;
  identifierId?: any;
  identifier?: any;
  title: string;
  deleted: boolean;
  infos: Info[];
  types: any[];
  z?: any;
  infoUrl?: any;
  infoUrlText?: any;
  description?: any;
  images: any[];
  peopleCapacity?: any;
}
export interface Info {
  id: number;
  poiId: number;
  name: string;
  priority: number;
  lang?: any;
}
export interface Point {
  type: string;
  coordinates: number[];
}
export interface Geometry {
  type: string;
  coordinates: number[][][];
}

export interface FloorObject {
  geometry: FloorGeometry;
  properties: FloorProperties;
}
export interface FloorProperties {
  buildingId: number;
  campusId: number;
  flags: any[];
  id: number;
  moh?: any;
  name: string;
  z: number;
}
export interface FloorGeometry {
  coordinates: number[][][];
  type: string;
}
