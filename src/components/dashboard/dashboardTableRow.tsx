import { TableCell, TableRow } from "../ui/table";
import { TelloDrone } from "../logo/telloDrone";
import { InspectionFirebase } from "@/lib/firebase/createData";
import { getdeviations } from "@/lib/firebase/readData";
import Link from "next/link";
import { getColor, getDay } from "@/lib/utils";
import { Button } from "../ui/button";

export const DashboardTableRow = async ({
  inspection,
}: {
  inspection: InspectionFirebase;
}) => {
  const deviationCount = (await getdeviations({
    inspectionId: inspection.id,
    countOnly: true,
  })) as number;

  const getRobot = (robot: string) => {
    if (robot === "drone") {
      return <TelloDrone size={40} />;
    }
    return robot;
  };
  return (
    <TableRow>
      <TableCell className="h-8 p-2 text-nowrap text-left pl-3">
        <Link href={`/${inspection.id}`}>
          {getDay(new Date(inspection.date.seconds * 1000))}
        </Link>
      </TableCell>
      <TableCell className="h-8 p-2">
        <Link href={`/${inspection.id}`}>{getRobot("drone")}</Link>
      </TableCell>
      <TableCell
        className={"font-semibold h-8 p-2"}
        style={{ color: getColor(inspection.status) }}
      >
        <Link href={`/${inspection.id}`}>{inspection.status}</Link>
      </TableCell>
      <TableCell className="h-8 p-2 text-center">
        <Link href={`/${inspection.id}`}>{deviationCount}</Link>
      </TableCell>
      <TableCell>
        <Button variant={"outline"}>
          <Link href={`/${inspection.id}`}>Gå til inspeksjon</Link>
        </Button>
      </TableCell>
    </TableRow>
  );
};
