"use client";

import { Suspense, useEffect, useState } from "react";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { MazeMapWrapper } from "../maps/mazeMapWrapper";
import { DashboardTable } from "./dashboardTable";
import { Building, getDrones } from "@/lib/firebase/readData";
import { DashboardMenu } from "./menu";
import { BuildingAreaFirebase } from "@/lib/dataTypes";
import { Drone } from "@/lib/firebase/createData";
import { ReloadIcon } from "@radix-ui/react-icons";

export interface SelectedFloor {
  name: string;
  zLevel: number;
  id: number;
}
export const Dashboard = ({ building }: { building: Building }) => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedArea, setSelectedArea] = useState<
    BuildingAreaFirebase | undefined
  >(undefined);
  const fetchAllDrones = async () => {
    const drones = await getDrones();
    setDrones(drones);
  };

  useEffect(() => {
    fetchAllDrones();
  }, []);
  const [selectedFloor, setSelectedFloor] = useState<SelectedFloor>({
    name: "3",
    zLevel: 3,
    id: 383,
  });
  return (
    <div className="flex flex-grow items-start flex-col w-full px-10 h-full">
      <h1 className="text-4xl font-bold mb-10">{building.name}</h1>
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg border h-full"
      >
        <DashboardMenu
          size={10}
          floorNames={building.floorNames}
          selectedFloor={selectedFloor}
          setSelectedFloor={setSelectedFloor}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
        />
        <ResizablePanel
          defaultSize={80}
          className="flex justify-between items-start"
        >
          {selectedArea && (
            <Suspense
              fallback={
                <div className="flex items-center justify-center">
                  <ReloadIcon className="mr-2 h-10 w-10 animate-spin" />
                </div>
              }
            >
              <DashboardTable selectedAreaId={selectedArea.id} />
            </Suspense>
          )}
          <MazeMapWrapper
            className="min-w-[800px] h-[500px]"
            selectedArea={selectedArea}
            zLevel={selectedFloor.zLevel}
            zoom={16}
            allDrones={drones.map((item) => {
              return {
                pos: item.location,
                buildingAreaId: item.buildingAreaId,
                id: item.id,
              };
            })}
            allFloors={building.floorGeometry}
            center={{ lat: 63.41559, lng: 10.4058 }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
