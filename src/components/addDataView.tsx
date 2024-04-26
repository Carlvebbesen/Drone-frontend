"use client";

import {
  Drone,
  createBuilding,
  createBuildingArea,
  createDrone,
  createInspectionSeries,
} from "@/lib/firebase/createData";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { SelectedFloor } from "./dashboard/dashboard";
import { useEffect, useState } from "react";
import { MazemapPos, PoiProps } from "./maps/mapUtils";
import { ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { DashboardMenu } from "./dashboard/menu";
import { Building, getDrones } from "@/lib/firebase/readData";
import { Input } from "./ui/input";
import { MazeMapWrapper } from "./maps/mazeMapWrapper";
import { Label } from "@radix-ui/react-dropdown-menu";
import { BuildingAreaFirebase } from "@/lib/dataTypes";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

export const AddDataView = ({ building }: { building: Building }) => {
  const { mutateWithToast, loading } = useMutationWithToast();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<SelectedFloor>({
    name: "3",
    zLevel: 3,
    id: 383,
  });
  useEffect(() => {
    async function fetchData() {
      const drones = await getDrones();
      setDrones(drones);
    }
    fetchData();
  }, []);

  const [selectedArea, setSelectedArea] = useState<
    BuildingAreaFirebase | undefined
  >(undefined);
  const [lastPoint, setLastPoint] = useState<MazemapPos | undefined>(undefined);
  const [roomsClicked, setRoomsClicked] = useState<PoiProps[]>([]);
  const [navn, setNavn] = useState<string>("");
  const [count, setCount] = useState<number | undefined>();
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
          <Card className="p-2">
            <CardTitle className="py-5">Oppdater Data</CardTitle>
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
                <Card className="flex flex-col gap-2 p-4">
                  <CardTitle>Lag et nytt Område</CardTitle>
                  <CardContent>
                    <Input
                      placeholder="Navn på området"
                      value={navn}
                      onChange={(e) => setNavn(e.target.value)}
                    />
                    <div className="flex justify-between p-2">
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
                          mutateWithToast({
                            mutatePromise: new Promise((resolve) =>
                              setTimeout(() => {
                                setRoomsClicked([]);
                                resolve(true);
                              }, 1000)
                            ),
                            textObj: {
                              actionType: "delete",
                              pluralForm: "rommene",
                              singularForm: "rom",
                            },
                          });
                        }}
                      >
                        Reset Rooms
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex flex-col gap-2 p-3">
                  <CardTitle>Lag en ny drone:</CardTitle>
                  <CardContent className="flex justify-between">
                    <Button
                      onClick={() => {
                        if (lastPoint && selectedArea) {
                          mutateWithToast({
                            mutatePromise: createDrone({
                              id: "hei",
                              isConnected: false,
                              lastUsed: new Date(),
                              connectionId: "TELLO-9C1649",
                              building: "Realfagsbygget",
                              batteryPercentage: 80,
                              temperature: 37,
                              location: {
                                zLevel: lastPoint.zLevel,
                                lngLat: {
                                  lat: lastPoint.lngLat.lat,
                                  lng: lastPoint.lngLat.lng,
                                },
                              },
                              buildingArea: selectedArea.name,
                              buildingAreaId: selectedArea.id,
                              floorId: selectedArea.floorId,
                              possibleTasks: [
                                "escaperoute inspection",
                                "ceiling inspection",
                                "room inspection",
                              ],
                              robotType: "drone",
                            }),
                            textObj: {
                              actionType: "create",
                              singularForm: "Drone",
                              pluralForm: "Dronen",
                            },
                          });
                        }
                      }}
                    >
                      Legg til en drone til området
                    </Button>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardTitle className="p-2">
                    Lag en inspeksjonsserie for området
                  </CardTitle>
                  <CardContent className="flex flex-col gap-4">
                    <Input
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value))}
                      placeholder="Antall"
                      type="number"
                    />
                    <Button
                      onClick={() => {
                        if (selectedArea && count) {
                          mutateWithToast({
                            mutatePromise: createInspectionSeries({
                              buildingAreaId: selectedArea.id,
                              areaName: selectedArea.name,
                              floorName: selectedFloor.name,
                              floorId: selectedArea.floorId,
                              droneId:
                                drones.find(
                                  (drone) =>
                                    drone.buildingAreaId === selectedArea.id
                                )?.id ?? " ",
                              inspectionType: "escaperoute inspection",
                              count: count,
                            }),
                            textObj: {
                              actionType: "create",
                              singularForm: "inspeksjonsserie",
                              pluralForm: "inspeksjonsserien",
                            },
                          });
                        } else {
                          toast.error("Du må velde et område");
                        }
                      }}
                    >
                      Generer serie
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div>
                {loading && (
                  <ReloadIcon className="mr-2 h-10 w-10 animate-spin" />
                )}
              </div>
            </CardContent>
          </Card>
          <MazeMapWrapper
            className="w-[900px] h-[900px]"
            showDots
            setPointClicked={setLastPoint}
            setRoomsClicked={setRoomsClicked}
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
