"use client";

import { Geometry, MazemapPos, PoiPoint } from "@/components/maps/mapUtils";
import { db } from "./config";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { convertFromTrippleNestedListToObject } from "../utils";
import { initBuildingFloors } from "../initBuilding";
import { subDays } from "date-fns";

export const createBuilding = async () => {
  await setDoc(doc(db, "Buildings", "Realfagsbygget"), {
    name: "Realfagsbygget",
    poiId: 1000459313,
    buildingId: 67,
    // geometry: {
    //   type: "Polygon",
    //   coordinates: convertFromTrippleNestedListToObject(
    //     initBuilding.geometry.coordinates
    //   ).coordinates,
    // },
    campusId: 1,
    floorNames: initBuildingFloors.map((item) => {
      return {
        name: item.properties.name,
        zLevel: item.properties.z,
        id: item.properties.id,
      };
    }),
    floorGeometry: initBuildingFloors.map((floor) => {
      return {
        name: floor.properties.name,
        zLevel: floor.properties.z,
        id: floor.properties.id,
        geometry: {
          type: floor.geometry.type,
          coordinates: convertFromTrippleNestedListToObject(
            floor.geometry.coordinates
          ).coordinates,
        },
      };
    }),
  });
  console.log("Created building");
};

export interface Drone {
  isConnected: boolean;
  lastUsed: Date;
  connectionId: string;
  building: string;
  batteryPercentage: number;
  temperature: number;
  location: MazemapPos;
  buildingArea: string;
  buildingAreaId: string;
  possibleTasks: string[];
  robotType: string;
  floorId: number;
  id: string;
}
export const createDrone = async (data: Drone) => {
  const docRef = await addDoc(collection(db, "drones"), {
    ...data,
    building: doc(db, "buildings", data.building),
    buildingArea: doc(db, "buildingArea", data.buildingAreaId),
  }).catch((error) => console.error(error));
  console.log("created doc");
};
interface BuildingArea {
  name: string;
  floorId: number;
  building: string;
  campusId: number;
  rooms: {
    type: string;
    properties: {
      title: string;
      kind: string;
      id: number;
      poiId: number;
      point: PoiPoint;
    };
    geometry: Geometry;
  }[];
}
export const createBuildingArea = async (data: BuildingArea) => {
  const docRef = await addDoc(collection(db, "buildingArea"), {
    name: data.name,
    campusId: data.campusId,
    floorId: data.floorId,
    building: doc(db, "buildings", data.building),
    rooms: data.rooms.map((room) => {
      return {
        ...room,
        properties: {
          ...room.properties,
        },
        geometry: {
          type: room.geometry.type,
          coordinates: convertFromTrippleNestedListToObject(
            room.geometry.coordinates
          ).coordinates,
        },
      };
    }),
  }).catch((error) => console.error(error));
  console.log("created doc buildingarea!!");
};
export interface Inspection {
  id: string;
  floorId: number;
  buildingAreaId: string;
  droneId: string;
  date: Date;
  status: "Success" | "onGoing" | "error";
  errorMsg: string;
  statusMsg: string;
  inspectionType:
    | "escaperoute inspection"
    | "ceiling inspection"
    | "room inspection"
    | "dust inspection";
}
export interface InspectionFirebase extends Inspection {
  detensionCount: number;
}
export const createSingleInspection = async (data: Inspection) => {
  const docRef = await addDoc(collection(db, "inspection"), {
    floorId: data.floorId,
    buildingAreaId: doc(db, "buildingArea", data.buildingAreaId),
    droneId: doc(db, "drones", data.droneId),
    date: data.date,
    status: data.status,
    errorMsg: data.errorMsg,
    statusMsg: data.statusMsg,
    inspectionType: data.inspectionType,
  }).catch((error) => console.error(error));
  console.log("created inspection!!");
};

export const createInspectionSeries = async ({
  floorId,
  buildingAreaId,
  droneId,
  inspectionType,
  count,
}: {
  floorId: number;
  buildingAreaId: string;
  droneId: string;
  count: number;
  inspectionType:
    | "escaperoute inspection"
    | "ceiling inspection"
    | "room inspection"
    | "dust inspection";
}) => {
  let counter = 0;
  while (counter < count) {
    const random = parseInt((Math.random() * 30).toFixed());
    await createSingleInspection({
      buildingAreaId: buildingAreaId,
      floorId: floorId,
      droneId: droneId,
      inspectionType: inspectionType,
      errorMsg: "",
      status: "Success",
      statusMsg: "Vellykket inspeksjon utført, ingen avvik funnet",
      id: "test",
      date: subDays(new Date().setHours(4), random),
    });
    counter++;
  }
};
