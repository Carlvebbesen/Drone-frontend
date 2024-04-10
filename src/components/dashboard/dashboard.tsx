"use client";

import { useMemo, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Command, CommandGroup, CommandItem } from "../ui/command";
import { area, realfagsByggetFloors } from "@/lib/dummData";
import { MazeMapWrapper } from "../maps/mazeMapWrapper";
import { DashboardTable } from "./dashboardTable";

export interface SelectedFloor {
  name: string;
  zLevel: number;
}
export interface SelectedArea {
  floorId: string;
  id: string;
  name: string;
  robotType: "drone" | "rover" | "washing";
}
export const Dashboard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFloor, setSelectedFloor] = useState<SelectedFloor>({
    name: "3",
    zLevel: 3,
  });
  const [selectedArea, setSelectedArea] = useState<SelectedArea | undefined>(
    undefined
  );
  const allFloors = useMemo(
    () =>
      realfagsByggetFloors
        .map((floor) => {
          return { name: floor.properties.name, zLevel: floor.properties.z };
        })
        .sort((a, b) => b.zLevel - a.zLevel),
    []
  );

  return (
    <div className="flex flex-grow justify-center items-center flex-col w-full px-10">
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg border h-full"
      >
        <ResizablePanel defaultSize={15}>
          <Command className="border shadow-md flex-grow">
            <CommandGroup heading="Etasjer" className="h-full flex-grow">
              {allFloors.map((floor) => (
                <CommandItem
                  // onClick={() => console.log(floor)}
                  onSelect={() => setSelectedFloor(floor)}
                  className="font-bold text-xl hover:bg-gray-200 pl-4 cursor-pointer"
                  style={{
                    background:
                      selectedFloor?.name === floor.name ? "#D3D3D3" : "",
                  }}
                  key={floor.name}
                >
                  Etasje {floor.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={15}>
          <Command className="border shadow-md flex-grow">
            <CommandGroup heading="Områder" className="h-full flex-grow">
              {area[selectedFloor.name].map((area) => (
                <CommandItem
                  // onClick={() => console.log(floor)}
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
        <ResizablePanel defaultSize={70} className="grid grid-cols-2 gap-2">
          <DashboardTable />
          <MazeMapWrapper
            className="w-[500px] h-[500px]"
            allFloors={realfagsByggetFloors}
            zLevel={selectedFloor.zLevel}
            setLoading={setLoading}
            showFloorLayer
            zoom={16}
            center={{ lat: 63.41559, lng: 10.4058 }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
