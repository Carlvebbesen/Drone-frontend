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
import { TelloDrone } from "../logo/telloDrone";
import { InspectionFirebase } from "@/lib/firebase/createData";
import { useCallback, useEffect, useState } from "react";
import { getInspections } from "@/lib/firebase/readData";

export const DashboardTable = ({
  selectedAreaId,
  name,
}: {
  name: string;
  selectedAreaId: string;
}) => {
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
  console.log(selectedAreaId);
  const [inspections, setInspections] = useState<InspectionFirebase[]>([]);
  const fetchInspectionForArea = useCallback(async () => {
    const data = await getInspections("L3efsOXfN3FUE8WTwxKu");
    if (data.length > 0) {
      setInspections(() => data);
    }
  }, []);
  useEffect(() => {
    fetchInspectionForArea();
  }, [fetchInspectionForArea]);
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
        {inspections.map((inspection) => (
          <TableRow key={inspection.id}>
            <TableCell className="h-8 p-2 text-nowrap text-left pl-3">
              {getDay(new Date(inspection.date))}
            </TableCell>
            <TableCell className="h-8 p-2">{getRobot("drone")}</TableCell>
            <TableCell
              className={"font-semibold h-8 p-2"}
              style={{ color: getColor(inspection.status) }}
            >
              {inspection.status}
            </TableCell>
            <TableCell className="h-8 p-2 text-center">
              {inspection.detensionCount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-left text-red-500">
            Error:{" "}
            {inspections.filter((item) => item.status === "error").length}
          </TableCell>
          <TableCell className="text-right">
            Avvik:{" "}
            {inspections.reduce(
              (sum, value) => (sum += value.detensionCount),
              0
            )}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};
