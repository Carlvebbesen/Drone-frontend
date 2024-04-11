"use client";

import { useState } from "react";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { MazeMapWrapper } from "../maps/mazeMapWrapper";
import { DashboardTable } from "./dashboardTable";
import { Building } from "@/lib/firebase/readData";
import { DashboardMenu } from "./menu";

export interface SelectedFloor {
  name: string;
  zLevel: number;
  id: number;
}
export interface SelectedArea {
  floorId: string;
  id: string;
  name: string;
  robotType: "drone" | "rover" | "washing";
}
export const Dashboard = ({ building }: { building: Building }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFloor, setSelectedFloor] = useState<SelectedFloor>({
    name: "1",
    zLevel: 3,
    id: 300,
  });
  const [selectedArea, setSelectedArea] = useState<SelectedArea | undefined>(
    undefined
  );
  return (
    <div className="flex flex-grow justify-center items-center flex-col w-full px-10">
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
          <DashboardTable />
          <MazeMapWrapper
            className="w-[500px] h-[500px]"
            allFloors={building.floorGeometry}
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
