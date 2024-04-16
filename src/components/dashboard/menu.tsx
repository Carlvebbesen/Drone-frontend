"use client";

import { Command, CommandGroup, CommandItem } from "../ui/command";
import { ResizableHandle, ResizablePanel } from "../ui/resizable";
import { Building, getBuildingAreas } from "@/lib/firebase/readData";
import { SelectedFloor } from "./dashboard";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { BuildingAreaFirebase } from "@/lib/dataTypes";

interface MenuProps {
  floorNames: Building["floorNames"];
  selectedFloor: SelectedFloor;
  setSelectedFloor: Dispatch<SetStateAction<SelectedFloor>>;
  selectedArea: BuildingAreaFirebase | undefined;
  setSelectedArea: Dispatch<SetStateAction<BuildingAreaFirebase | undefined>>;
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
  const [buildingAreas, setBuildingAreas] = useState<BuildingAreaFirebase[]>(
    []
  );
  const fetchAllForEachFloor = async (floorId: number) => {
    const areas = await getBuildingAreas({ floorId: floorId });
    setBuildingAreas(() => areas);
  };
  useEffect(() => {
    fetchAllForEachFloor(selectedFloor.id);
  }, [selectedFloor]);
  return (
    <>
      <ResizablePanel defaultSize={size}>
        <Command className="border shadow-md flex-grow">
          <CommandGroup heading="Etasjer" className="h-full flex-grow">
            {floorNames
              .sort((a, b) => b.zLevel - a.zLevel)
              .map((floor) => (
                <CommandItem
                  disabled={floor.zLevel < -1}
                  onSelect={() => {
                    setSelectedArea((_) => undefined);
                    setSelectedFloor(() => floor);
                  }}
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
            {buildingAreas.length > 0 &&
              buildingAreas.map((area) => (
                <CommandItem
                  onSelect={() => setSelectedArea(() => area)}
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
