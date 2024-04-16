import {
  DocumentData,
  DocumentReference,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { ConvertedFormatTrippel } from "../utils";
import { BuildingAreaFirebase } from "../dataTypes";
import { Drone, Inspection, InspectionFirebase } from "./createData";

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

export const getBuildingAreas = async ({ floorId }: { floorId: number }) => {
  const areaRef = collection(db, "buildingArea");
  const q = query(areaRef, where("floorId", "==", floorId));
  const docs = await getDocs(q);
  const res: BuildingAreaFirebase[] = [];
  docs.forEach((area) => {
    res.push({
      id: area.id,
      ...(area.data() as BuildingAreaFirebase),
    });
  });
  return res;
};

export const getDetensions = async ({
  inspectionId,
  countOnly,
}: {
  inspectionId: DocumentReference<DocumentData, DocumentData>;
  countOnly: boolean;
}) => {
  const detensionRef = collection(db, "detension");
  const q = query(detensionRef, where("inspection", "==", inspectionId));
  const docs = await getDocs(q);
  if (countOnly) {
    return docs.size;
  }
  const res: any[] = [];
  docs.forEach((detension) => {
    res.push({
      id: detension.id,
      ...(detension.data() as any),
    });
  });
  return res;
};

export const getInspections = async (buildingAreaId: string) => {
  const inspectionRef = collection(db, "inspection");
  const q = query(
    inspectionRef,
    orderBy("date"),
    where("buildingAreaId", "==", doc(db, "buildingArea", buildingAreaId))
  );
  const docs = await getDocs(q);
  const res: InspectionFirebase[] = [];
  docs.forEach(async (inspection) => {
    res.push({
      id: inspection.id,
      ...(inspection.data() as Inspection),
      detensionCount: (await getDetensions({
        inspectionId: inspection.ref,
        countOnly: true,
      })) as number,
    });
  });
  return res;
};
export const getDrones = async () => {
  const droneRef = collection(db, "drones");
  const docs = await getDocs(droneRef);
  const res: Drone[] = [];
  docs.forEach((area) => {
    res.push({
      id: area.id,
      ...(area.data() as Drone),
    });
  });
  return res;
};
