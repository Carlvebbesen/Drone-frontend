"use client";

import { area } from "@/lib/dummData";
import { Command, CommandGroup, CommandItem } from "../ui/command";
import { ResizableHandle, ResizablePanel } from "../ui/resizable";
import { Building } from "@/lib/firebase/readData";
import { SelectedArea, SelectedFloor } from "./dashboard";
import { Dispatch, SetStateAction } from "react";

interface MenuProps {
  floorNames: Building["floorNames"];
  selectedFloor: SelectedFloor;
  setSelectedFloor: Dispatch<SetStateAction<SelectedFloor>>;
  selectedArea: SelectedArea | undefined;
  setSelectedArea: Dispatch<SetStateAction<SelectedArea | undefined>>;
  size?: number;
}

export const DashboardMenu = ({
  floorNames,
  size = 15,
  selectedFloor,
  setSelectedFloor,
  selectedArea,
  setSelectedArea,
}: MenuProps) => {
  return (
    <>
      <ResizablePanel defaultSize={size}>
        <Command className="border shadow-md flex-grow">
          <CommandGroup heading="Etasjer" className="h-full flex-grow">
            {floorNames
              .sort((a, b) => b.zLevel - a.zLevel)
              .map((floor) => (
                <CommandItem
                  onSelect={() => setSelectedFloor(floor)}
                  className="font-bold text-xl hover:bg-gray-200 pl-4 cursor-pointer"
                  style={{
                    background: selectedFloor?.id === floor.id ? "#D3D3D3" : "",
                  }}
                  key={floor.id}
                >
                  Etasje {floor.name}
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={size}>
        <Command className="border shadow-md flex-grow">
          <CommandGroup heading="Områder" className="h-full flex-grow">
            {area[selectedFloor.name].map((area) => (
              <CommandItem
                onSelect={() => setSelectedArea(area)}
                className="font-bold text-xl hover:bg-gray-200 pl-4 cursor-pointer"
                style={{
                  background: selectedArea?.id === area.id ? "#D3D3D3" : "",
                }}
                key={area.id}
              >
                Område {area.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
};
