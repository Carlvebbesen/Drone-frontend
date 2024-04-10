import type { ColumnDef } from "@tanstack/react-table";
import { TelloDrone } from "../logo/telloDrone";
import {
  differenceInCalendarMonths,
  format,
  getMonth,
  getWeek,
  isToday,
  isYesterday,
} from "date-fns";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type InspectionColumns = {
  name: number;
  detensionCount: number;
  status: string;
  launchType: string;
  scheduleType: string;
  time: string;
  elapsedTime: string;
  droneId: string;
};
const getDay = (date: Date) => {
  if (isToday(date)) {
    return `Idag kl: ${format(date, "k:m")}`;
  }
  if (isYesterday(date)) {
    return `Igår kl: ${format(date, "k:m")}`;
  }
  if (getWeek(date) - 1 === getWeek(new Date())) {
    return "forrige uke";
  }
  if (getMonth(date) - 1 === getMonth(new Date())) {
    return "forrige måned";
  }
  return `${differenceInCalendarMonths(new Date(), date)} måneder siden`;
};
const getColor = (state: string) => {
  if (state === "error") return "red";
  if (state === "onGoing") return "gray";
  if (state === "success") return "green";
  return "";
};

export const columns: ColumnDef<InspectionColumns>[] = [
  // {
  //   accessorKey: "name",
  //   header: "InspeksjonsNavn",
  //   cell: ({ row }) => {
  //     return <div>{`#${row.getValue("name")} Inspeksjon`}</div>;
  //   },
  // },
  {
    accessorKey: "time",
    header: "Tid",
    cell: ({ row }) => {
      return <div className="text-nowrap">{getDay(row.getValue("time"))}</div>;
    },
  },
  {
    accessorKey: "droneId",
    header: "Robot",
    cell: ({ row }) => {
      return <TelloDrone size={40} />;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const value = row.getValue("status") as string;
      return (
        <div className={"font-semibold"} style={{ color: getColor(value) }}>
          {value}
        </div>
      );
    },
  },

  {
    accessorKey: "detensionCount",
    header: "Avvik",
    cell: ({ row }) => {
      return <div>{row.getValue("detensionCount")}</div>;
    },
  },
];
