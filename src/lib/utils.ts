import { type ClassValue, clsx } from "clsx";
import {
  differenceInCalendarMonths,
  differenceInDays,
  differenceInWeeks,
  format,
  getMonth,
  isToday,
  isYesterday,
} from "date-fns";
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

export const getColor = (state: string) => {
  if (state === "error") return "red";
  if (state === "onGoing") return "gray";
  if (state === "success") return "green";
  return "";
};

export const getDay = (date: Date) => {
  if (isToday(date)) {
    return `Idag kl: ${format(date, "k:m")}`;
  }
  if (isYesterday(date)) {
    return `Igår kl: ${format(date, "k:m")}`;
  }

  if (
    differenceInDays(date, new Date()) == -2 ||
    differenceInDays(date, new Date()) == -3
  ) {
    return `Onsdag kl: ${format(date, "k:m")}`;
  }
  if (differenceInWeeks(new Date(), date) === 0) {
    return "Forrige uke";
  }
  if (getMonth(date) === getMonth(new Date())) {
    const count = differenceInWeeks(new Date(), date);
    const days = differenceInDays(new Date(), date);
    return `${count} ${count === 1 ? "uke" : "uker"} ${days !== 0 ? `, og ${days} dager` : ""} siden`;
  }
  if (differenceInCalendarMonths(new Date(), date)) {
    return "Forrige måned";
  }
  return `${differenceInCalendarMonths(new Date(), date)} måneder siden`;
};
