"use client";

import { DetensionFirebase } from "@/lib/firebase/readData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowBigRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export const MenuDetension = ({
  detensions,
  inspectionTime,
}: {
  inspectionTime: number;
  detensions: DetensionFirebase[];
}) => {
  const searchParams = useSearchParams();

  const activeItem = searchParams.get("detensionid");
  const pathname = usePathname();
  return (
    <div className="border">
      {detensions.map((item, index) => (
        <Link
          className={cn(
            "flex font-bold justify-start items-center w-full shadow-md h-20 min-w-96 flex-grow-1 px-2 gap-4",
            activeItem === item.id ? "bg-gray-300" : ""
          )}
          key={item.id}
          href={`${pathname}?detensionid=${item.id}`}
        >
          <div className="text-nowrap">#{index + 1}</div>
          <div className="text-nowrap">
            Obstruksjoner: {item.detensionCount}
          </div>
          <div
            className={cn(
              "font-normal text-nowrap",
              item.isValid ? "text-green-600" : "text-red-600"
            )}
          >
            Status:{item.isValid ? " Gyldig" : " Feil registrering"}
          </div>
          <div className="text-nowrap">
            Klokka:{" "}
            {format(
              new Date(
                inspectionTime * 1000 + (item.findings[0].frame / 25) * 1000
              ),
              "HH:mm:s"
            )}
          </div>
          <div className=" flex-grow flex justify-end">
            <ArrowBigRight />
          </div>
        </Link>
      ))}
    </div>
  );
};
