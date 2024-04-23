"use client";

import { DetensionFirebase } from "@/lib/firebase/readData";
import { cn } from "@/lib/utils";
import { ArrowBigRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export const MenuDetension = ({
  detensions,
}: {
  detensions: DetensionFirebase[];
}) => {
  const searchParams = useSearchParams();

  const activeItem = searchParams.get("id");
  const pathname = usePathname();
  return (
    <div className="border flex-grow">
      {detensions.map((item, index) => (
        <Link
          className={cn(
            "flex font-bold w-full justify-around items-center shadow-md h-20",
            activeItem === item.id ? "bg-gray-500" : ""
          )}
          key={item.id}
          href={`${pathname}?id=${item.id}`}
        >
          <div>#{index + 1}</div>
          <div>Obstruksjoner: {item.detensionCount}</div>
          <div
            className={cn(
              "font-normal",
              item.isValid ? "text-green-600" : "text-red-600"
            )}
          >
            Status:{item.isValid ? " Gyldig" : " Feil registrering"}
          </div>
          <ArrowBigRight />
        </Link>
      ))}
    </div>
  );
};
