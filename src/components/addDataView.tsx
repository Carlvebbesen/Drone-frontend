"use client";

import { createBuilding, createBuildingArea } from "@/lib/firebase/createData";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { SelectedArea, SelectedFloor } from "./dashboard/dashboard";
import { useState } from "react";
import { PoiProps } from "./maps/mapUtils";
import { ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { DashboardMenu } from "./dashboard/menu";
import { Building } from "@/lib/firebase/readData";
import { Input } from "./ui/input";
import { MazeMapWrapper } from "./maps/mazeMapWrapper";
import { Label } from "@radix-ui/react-dropdown-menu";

export const AddDataView = ({ building }: { building: Building }) => {
  const { mutateWithToast, loading } = useMutationWithToast();
  const [selectedFloor, setSelectedFloor] = useState<SelectedFloor>({
    name: "1",
    zLevel: 3,
    id: 300,
  });
  const [selectedArea, setSelectedArea] = useState<SelectedArea | undefined>(
    undefined
  );
  const [roomsClicked, setRoomsClicked] = useState<PoiProps[]>([]);
  const [navn, setNavn] = useState<string>("");

  return (
    <div className="flex flex-grow justify-center items-center flex-col w-full px-10">
      <h1>{building.name}</h1>
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
        <ResizablePanel defaultSize={70} className="grid grid-cols-2 gap-2">
          <Card>
            <CardHeader>
              <CardTitle>Oppdater Data</CardTitle>
              <CardContent className="grid grid-cols-10">
                <div className="col-span-9 flex flex-col gap-6">
                  <Button
                    onClick={async () => {
                      mutateWithToast({
                        mutatePromise: createBuilding(),
                        textObj: {
                          actionType: "create",
                          singularForm: "bygning",
                          pluralForm: "bygningen",
                        },
                      });
                    }}
                  >
                    Lag Realfagsbygget
                  </Button>
                  <div className="flex flex-col gap-2">
                    <Label>Navn på Område</Label>
                    <Input
                      value={navn}
                      onChange={(e) => setNavn(e.target.value)}
                    />
                    <div className="flex justify-between">
                      <Button
                        onClick={() => {
                          mutateWithToast({
                            mutatePromise: createBuildingArea({
                              name: navn,
                              building: "Realfagsbygget",
                              campusId: 1,
                              floorId: selectedFloor.id,
                              rooms: roomsClicked,
                            }),
                            textObj: {
                              actionType: "create",
                              singularForm: "område",
                              pluralForm: "området",
                            },
                          });
                        }}
                      >
                        Lag et nytt område
                      </Button>
                      <Button
                        onClick={() => {
                          setRoomsClicked([]);
                        }}
                      >
                        Reset Rooms
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  {loading && (
                    <ReloadIcon className="mr-2 h-10 w-10 animate-spin" />
                  )}
                </div>
              </CardContent>
            </CardHeader>
          </Card>
          <MazeMapWrapper
            className="w-[500px] h-[500px]"
            showDots
            setRoomsClicked={setRoomsClicked}
            allFloors={building.floorGeometry}
            zLevel={selectedFloor.zLevel}
            showFloorLayer
            zoom={16}
            center={{ lat: 63.41559, lng: 10.4058 }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
