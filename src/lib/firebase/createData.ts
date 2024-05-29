"use client";

import { Geometry, MazemapPos, PoiPoint } from "@/components/maps/mapUtils";
import { db, fireStorageInstance } from "./config";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  DocumentReference,
  DocumentData,
} from "firebase/firestore";
import { convertFromTrippleNestedListToObject } from "../utils";
import { initBuildingFloors } from "../initBuilding";
import { subDays } from "date-fns";
import { taskEnum } from "@/components/createAdHoc";
import { MapProps } from "@/components/maps/mazeMapWrapper";
import { ref, uploadString } from "firebase/storage";

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
    // },∂
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
function generateHash(stringObj: string) {
  var hash = 0,
    i,
    chr;
  if (stringObj.length === 0) return hash;
  for (i = 0; i < stringObj.length; i++) {
    chr = stringObj.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export const createMission = async (
  map: MapProps,
  values: { type: any; date: Date; område: string; floor: string }
) => {
  const id = generateHash(JSON.stringify(map));
  const storageRef = ref(fireStorageInstance, `map/${id}`);
  await uploadString(storageRef, map.imgUrl, "data_url");
  const docRef = await addDoc(collection(db, "Mission"), {
    ...map,
    imgUrl: `map/${id}`,
    ...values,
  }).catch((error) => console.error(error));
  console.log("created mission");
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
  floorId: number;
  floorName: string;
  areaName: string;
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
export interface InspectionFirebase extends fromFirebaseIns {
  id: string;
}
export interface fromFirebaseIns {
  floorId: number;
  buildingAreaId: DocumentReference<DocumentData, DocumentData>;
  droneId: string;
  status: "Success" | "onGoing" | "error";
  errorMsg: string;
  statusMsg: string;
  inspectionType:
    | "escaperoute inspection"
    | "ceiling inspection"
    | "room inspection"
    | "dust inspection";
  date: {
    seconds: number;
    nanoseconds: number;
  };
}
export const createSingleInspection = async (data: Inspection) => {
  const docRef = await addDoc(collection(db, "inspection"), {
    floorId: data.floorId,
    buildingAreaId: doc(db, "buildingArea", data.buildingAreaId),
    droneId: doc(db, "drones", data.droneId),
    date: data.date,
    floorName: data.floorName,
    areaName: data.areaName,
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
  floorName,
  areaName,
  inspectionType,
  count,
}: {
  floorId: number;
  floorName: string;
  areaName: string;
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
      floorName: floorName,
      areaName: areaName,
      inspectionType: inspectionType,
      errorMsg: "",
      status: "Success",
      statusMsg: "Vellykket inspeksjon utført, ingen avvik funnet",
      date: subDays(new Date().setHours(4), random),
    });
    counter++;
  }
};
