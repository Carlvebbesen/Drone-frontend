import { doc, getDoc } from "firebase/firestore";
import { db } from "./config";
import { ConvertedFormatTrippel } from "../utils";

export interface Building {
  name: string;
  poiId: number;
  buildingId: number;
  //   geometry: {
  //     type: string;
  //     coordinates: ConvertedFormatTrippel["coordinates"];
  //   };
  campusId: number;
  floorNames: { name: string; zLevel: number; id: number }[];
  floorGeometry: {
    name: string;
    zLevel: number;
    id: number;
    geometry: {
      type: string;
      coordinates: ConvertedFormatTrippel["coordinates"];
    };
  }[];
}

export const getBuilding = async (buildingName: string) => {
  const docRef = doc(db, "Buildings", buildingName);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Building;
  }
  throw new Error("Building does not exist");
};
