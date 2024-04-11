"use client";

import { Geometry, MazemapPos, PoiPoint } from "@/components/maps/mapUtils";
import { db } from "./config";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import {
  convertFromDoubleNestedListToObject,
  convertFromTrippleNestedListToObject,
} from "../utils";
import { initBuilding, initBuildingFloors } from "../initBuilding";

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

interface Drone {
  isConnected: boolean;
  lastUsed: Date;
  connectionId: string;
  building: string;
  batteryPercentage: number;
  temperature: number;
  location: MazemapPos;
  buildingArea: string;
  possibleTasks: string[];
  robotType: string;
}
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
export const createDrone = async (data: Drone) => {
  const docRef = await addDoc(collection(db, "drones"), {
    ...data,
    building: doc(db, "buildings", data.building),
    buildingArea: doc(db, "buildingArea", data.buildingArea),
  });
  console.log("created doc", docRef.id);
};
export const createBuildingArea = async (data: BuildingArea) => {
  const docRef = await addDoc(collection(db, "buildingArea"), {
    ...data,
    building: doc(db, "buildings", data.building),
    rooms: data.rooms.map((room) => {
      return {
        ...room,
        properties: {
          ...room.properties,
        },
        geometry: {
          type: room.geometry.type,
          coordinates: convertFromDoubleNestedListToObject(
            room.geometry.coordinates
          ).coordinates,
        },
      };
    }),
  });
  console.log("created doc", docRef.id);
};
