import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getInspections } from "@/lib/firebase/readData";
import { DashboardTableRow } from "./dashboardTableRow";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Card } from "../ui/card";

export const DashboardTable = async ({
  selectedAreaId,
}: {
  selectedAreaId: string;
}) => {
  const inspections = await getInspections(selectedAreaId);
  return (
    <div className="flex justify-between flex-col h-full pb-2">
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
          {inspections.slice(0, 10).map((inspection) => (
            <DashboardTableRow key={inspection.id} inspection={inspection} />
          ))}
          {inspections.length === 0 && (
            <TableRow>
              <TableCell>Ingen inspeksjoner utført enda</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Card className="p-1">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#1">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Card>
    </div>
  );
};
