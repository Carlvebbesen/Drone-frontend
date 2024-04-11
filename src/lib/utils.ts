import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const firstLetterUppercase = (text: string) => {
  if (text.length > 0) {
    return (text[0] ?? "").toUpperCase() + text.slice(1);
  }
  return text;
};

export interface ConvertedFormatTrippel {
  coordinates: { [index: number]: { [index: number]: number[] } };
}
export interface ConvertedFormatDobbel {
  coordinates: { [index: number]: number[] };
}

export function convertFromDoubleNestedListToObject(
  data: number[][]
): ConvertedFormatDobbel {
  const coordinates: ConvertedFormatDobbel["coordinates"] = {};
  data.forEach((location, index) => {
    coordinates[index] = location;
  });
  return { coordinates };
}

export function convertFromTrippleNestedListToObject(
  data: number[][][]
): ConvertedFormatTrippel {
  const coordinates: ConvertedFormatTrippel["coordinates"] = {};

  data.forEach((points, index) => {
    const section: ConvertedFormatDobbel["coordinates"] = {};
    points.forEach((location, innerIndex) => {
      section[innerIndex] = location;
    });
    coordinates[index] = section;
  });
  return { coordinates };
}
export function revertToTrippelNestedList(
  data: ConvertedFormatTrippel["coordinates"]
): {
  coordinates: number[][][];
} {
  const revertedCoordinates: number[][][] = [];

  Object.keys(data).forEach((key) => {
    const section: number[][] = [];
    const index = parseInt(key);
    Object.keys(data[index]).forEach((innerKey) => {
      const innerIndex = parseInt(innerKey);
      section.push(data[index][innerIndex]);
    });

    revertedCoordinates.push(section);
  });

  return { coordinates: revertedCoordinates };
}
export function revertToDobbelNestedList(
  data: ConvertedFormatDobbel["coordinates"]
): {
  coordinates: number[][];
} {
  const revertedCoordinates: number[][] = [];

  Object.keys(data).forEach((key) => {
    const index = parseInt(key);
    revertedCoordinates.push(data[index]);
  });

  return { coordinates: revertedCoordinates };
}
