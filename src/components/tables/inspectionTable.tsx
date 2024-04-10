"use client";

import {
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { DataTable } from "./dataTable";
import { InspectionColumns, columns } from "./inspectionColumns";
import { inspections } from "@/lib/dummData";

const InspectionTable = () => {
  const data: InspectionColumns[] = inspections.map((item) => {
    return { ...item, detensionCount: item.detentions.length };
  });

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTable
      className="overflow-auto max-h-[500px]"
      columns={columns}
      table={table}
    />
  );
};

export default InspectionTable;
 