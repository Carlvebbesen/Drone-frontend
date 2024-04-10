"use client";

import {
  differenceInCalendarMonths,
  format,
  getMonth,
  getWeek,
  isToday,
  isYesterday,
} from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { inspections } from "@/lib/dummData";
import { TelloDrone } from "../logo/telloDrone";

export const DashboardTable = () => {
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
  const getRobot = (robot: string) => {
    if (robot === "drone") {
      return <TelloDrone size={40} />;
    }
    return robot;
  };

  const data = inspections.slice(0, 8);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tid</TableHead>
          <TableHead>Robot</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Avvik</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((inspection) => (
          <TableRow key={inspection.id}>
            <TableCell className="h-8 p-2 text-nowrap text-left pl-3">
              {getDay(new Date(inspection.time))}
            </TableCell>
            <TableCell className="h-8 p-2">{getRobot("drone")}</TableCell>
            <TableCell
              className={"font-semibold h-8 p-2"}
              style={{ color: getColor(inspection.status) }}
            >
              {inspection.status}
            </TableCell>
            <TableCell className="h-8 p-2 text-center">
              {inspection.detentions.length}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-left text-red-500">
            Error: {data.filter((item) => item.status === "error").length}
          </TableCell>
          <TableCell className="text-right">
            Avvik:{" "}
            {data.reduce((sum, value) => (sum += value.detentions.length), 0)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};
