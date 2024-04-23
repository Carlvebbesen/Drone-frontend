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

export const DashboardTable = async ({
  selectedAreaId,
}: {
  searchParams: {
    [index: string]: string;
  };
  params: {
    [index: string]: string;
  };
  selectedAreaId: string;
}) => {
  const inspections = await getInspections(selectedAreaId);
  return (
    <div className="flex items-center justify-start flex-col">
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
            <DashboardTableRow key={inspection.id} inspection={inspection} />
          ))}
          {inspections.length === 0 && (
            <TableRow>
              <TableCell>Ingen inspeksjoner utført enda</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#2" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#3">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
