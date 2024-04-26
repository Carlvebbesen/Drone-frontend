import {
  DocumentData,
  DocumentReference,
  and,
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
import { Drone, InspectionFirebase, fromFirebaseIns } from "./createData";
import { LngLat } from "@/components/maps/mapUtils";

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
      ...(area.data() as BuildingAreaFirebase),
      id: area.id,
    });
  });
  return res;
};
export const getBuildingArea = async ({
  buildingArea,
}: {
  buildingArea: DocumentReference<DocumentData, DocumentData>;
}) => {
  const docSnap = await getDoc(buildingArea);
  if (docSnap.exists()) {
    return {
      ...(docSnap.data() as BuildingAreaFirebase),
      id: docSnap.id,
      building: docSnap.data().building.toString(),
    };
  }
  throw new Error("Building does not exist");
};
export interface DetensionFirebase {
  id: string;
  detensionCount: number;
  inspectionId: string;
  isValid: boolean;
  location?: LngLat;
  findings: {
    id: string;
    detensions: { [index: number]: { conf: number; name: string } };
    frame: number;
    imgId: string;
  }[];
}
interface AllInspections extends InspectionFirebase {
  detensionCount: number;
  id: string;
  buildingAreaName: string;
}
export const getAllInspectionsWithDetensions = async () => {
  const detensionRef = collection(db, "detension");
  const q = query(
    detensionRef,
    orderBy("date", "desc"),
    where("detensionCount", ">", 0)
  );
  const docs = await getDocs(q);
  const res: AllInspections[] = [];
  await Promise.all(
    docs.docs.map(async (detension) => {
      const inspection = await getDoc(
        doc(db, "inspection", detension.data().inspectionId)
      );
      const detensionCount = detension.data().detensionCount;
      //@ts-ignore
      const buildingArea = await getDoc(inspection.data().buildingAreaId);
      //@ts-ignore
      res.push({
        ...inspection.data(),
        //@ts-ignore
        buildingAreaName: buildingArea.data().name ?? "",
        id: inspection.id,

        detensionCount: detensionCount,
      });
    })
  );
  return res;
};

export const getDetensions = async ({
  inspectionId,
  countOnly,
}: {
  inspectionId: string;
  countOnly: boolean;
}) => {
  const detensionRef = collection(db, "detension");
  const q = query(
    detensionRef,
    where("inspectionId", "==", inspectionId),
    where("detensionCount", ">", 0)
  );
  const docs = await getDocs(q);
  if (countOnly) {
    return docs.size;
  }
  const res: DetensionFirebase[] = [];
  await Promise.all(
    docs.docs.map(async (detension) => {
      const tmp = {
        id: detension.id,
        ...(detension.data() as any),
      };
      const findings = collection(detension.ref, "findings");
      const subCol = await getDocs(findings);

      tmp["findings"] = [];
      subCol.forEach((item) => {
        tmp["findings"].push({ ...item.data() });
      });
      res.push(tmp);
    })
  );
  return res;
};

export const getInspections = async (buildingAreaId: string) => {
  const inspectionRef = collection(db, "inspection");
  const q = query(
    inspectionRef,
    orderBy("date", "desc"),
    where("buildingAreaId", "==", doc(db, "buildingArea", buildingAreaId))
  );
  const docs = await getDocs(q);
  const res: InspectionFirebase[] = [];
  docs.forEach((inspection) => {
    res.push({
      id: inspection.id,
      ...(inspection.data() as fromFirebaseIns),
    });
  });
  return res;
};

export const getInspection = async (inspectionId: string) => {
  const docRef = doc(db, "inspection", inspectionId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...(docSnap.data() as fromFirebaseIns), id: docSnap.id };
  }
  throw new Error("Building does not exist");
};
export const getDrones = async () => {
  const droneRef = collection(db, "drones");
  const docs = await getDocs(droneRef);
  const res: Drone[] = [];
  docs.forEach((area) => {
    res.push({
      ...(area.data() as Drone),
      id: area.id,
    });
  });
  return res;
};
