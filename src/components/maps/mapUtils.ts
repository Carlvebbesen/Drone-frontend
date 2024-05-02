export interface PoiProps {
  type: string;
  geometry: Geometry;
  properties: PoiProperties;
}
export interface GeoJson {
  type: string;
  geometry: Geometry;
  properties: { name: string };
}
export interface PoiProperties {
  title: string;
  id: number;
  point: PoiPoint;
  poiId: number;
  identifier: string;
  campusId: number;
  floorId: number;
  zLevel: number;
  floorName: string;
  buildingName: string;
  buildingId: number;
  infoUrl?: any;
  infoUrlText?: any;
  description?: any;
  images: any[];
  names: string[];
  types: any[];
  kind: string;
  peopleCapacity?: any;
  externalReferenceTypes: any[];
}
export interface PoiPoint {
  type: string;
  coordinates: number[];
}

export interface RouteProps {
  type: string;
  features: Feature[];
  properties: Properties2;
}
export interface Properties2 {
  pathMetrics: PathMetrics;
}
export interface PathMetrics {
  durationWalkingMinutes: number;
  durationDrivingMinutes: number;
  durationCyclingMinutes: number;
  distanceWalkingMeters: number;
  distanceCyclingMeters: number;
  distanceDrivingMeters: number;
  durationEstimateSeconds: number;
}
export interface Feature {
  type: string;
  geometry: Geometry;
  id: number;
  properties: Properties;
}
export interface Properties {
  m: number;
  z: number;
  buildingId: number;
  target: number;
  flags: any[];
  travelMode: string;
  travelType: string;
  transitInfo?: any;
  source: string;
  timeEstimateSeconds: number;
  startTime?: any;
  endTime?: any;
  "line-color": string;
  "line-opacity": number;
}
export interface Geometry {
  type: string;
  coordinates: number[][][];
}

export interface BlueDot {
  setLngLat: (lngLat: LngLat) => BlueDot;
  setZLevel: (level: number) => BlueDot;
  setAccuracy: (level: number) => BlueDot;
  show: () => void;
  destroy: () => void;
}

export interface MazeMarker {
  setLngLat: (lngLat: LngLat) => MazeMarker;
  setZLevel: (level: number) => MazeMarker;
  setAccuracy: (level: number) => MazeMarker;
  show: () => void;
  addTo: (map: any) => MazeMarker;
  remove: () => void;
  options: any;
  _lngLat: LngLat;
  on: (event: string, callback: () => void) => void;
}

export interface MazeMapViewProps {
  mapOriginGeo: LngLat;
  mapAngleTransform: number;
  onMapPointClick?: (
    e: any,
    rosPoint: Pos,
    Mazemap: any,
    mapRef: React.MutableRefObject<any>
  ) => void;
  onMapReady?: (Mazemap: any, mapRef: React.MutableRefObject<any>) => void;
  containerClassName?: string;
  zoom?: number;
  jumpTo?: LngLat;
  zLevel?: number;
  showMapOrigin?: boolean;
  legend?: JSX.Element;
}

export interface MazemapPos {
  lngLat: { lng: number; lat: number };
  zLevel: number;
}
export type LngLat = {
  lng: number;
  lat: number;
};
export type Pos = {
  x: number;
  y: number;
};
