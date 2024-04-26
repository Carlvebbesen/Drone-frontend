import { DashboardTableRow } from "@/components/dashboard/dashboardTableRow";
import { TelloDrone } from "@/components/logo/telloDrone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAllInspectionsWithDetensions,
  getBuildingAreas,
} from "@/lib/firebase/readData";
import { getColor, getDay } from "@/lib/utils";
import Link from "next/link";

const Page = async () => {
  const inspections = await getAllInspectionsWithDetensions();
  const getRobot = (robot: string) => {
    if (robot === "drone") {
      return <TelloDrone size={40} />;
    }
    return robot;
  };
  console.log(inspections);
  return (
    <div className="p-10 flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-20">
        Dette er avvikene som har skjedd de siste 7 dagene
      </h1>
      <Card className="min-w-[800px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tid</TableHead>
              <TableHead>Robot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Område</TableHead>
              <TableHead>Avvik</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.slice(0, 10).map((inspection) => (
              <TableRow key={inspection.id}>
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
                  <Link href={`/${inspection.id}`}>
                    {inspection.buildingAreaName}
                  </Link>
                </TableCell>
                <TableCell className="h-8 p-2 text-center">
                  <Link href={`/${inspection.id}`}>
                    {inspection.detensionCount}
                  </Link>
                </TableCell>
                <TableCell>
                  <Button variant={"outline"}>
                    <Link href={`/${inspection.id}`}>Gå til inspeksjon</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {inspections.length === 0 && (
              <TableRow>
                <TableCell>Ingen inspeksjoner utført enda</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Page;
