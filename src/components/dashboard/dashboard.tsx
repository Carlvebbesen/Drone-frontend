"use client";

import { useEffect, useState } from "react";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { MazeMapWrapper } from "../maps/mazeMapWrapper";
import { DashboardTable } from "./dashboardTable";
import { Building, getDrones, getInspections } from "@/lib/firebase/readData";
import { DashboardMenu } from "./menu";
import { BuildingAreaFirebase } from "@/lib/dataTypes";
import { Drone, InspectionFirebase } from "@/lib/firebase/createData";

export interface SelectedFloor {
  name: string;
  zLevel: number;
  id: number;
}
export const Dashboard = ({ building }: { building: Building }) => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState<Boolean>(false);
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
    <div className="flex flex-grow justify-center items-center flex-col w-full px-10 h-full">
      <h1>{building.name}</h1>
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg border h-full"
      >
        <DashboardMenu
          floorNames={building.floorNames}
          selectedFloor={selectedFloor}
          setSelectedFloor={setSelectedFloor}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
        />
        <ResizablePanel defaultSize={70} className="grid grid-cols-2 gap-2">
          {selectedArea && !loading && (
            <DashboardTable
              name={selectedArea.name}
              selectedAreaId={selectedArea.id}
            />
          )}
          <MazeMapWrapper
            className="w-[600px] h-[600px]"
            setLoading={setLoading}
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
