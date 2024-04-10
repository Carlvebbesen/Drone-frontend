"use client";

import { TelloDrone } from "@/components/logo/telloDrone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { drones } from "@/lib/dummData";
import { format } from "date-fns";
import router from "next/router";
import { ReactElement } from "react";

export const P = ({
  children,
  color,
  className,
}: {
  children: ReactElement | string | number;
  className?: string;
  color?: string;
}) => (
  <p className={cn("text-sm", className)} style={{ color: color }}>
    {children}
  </p>
);
const Droner = () => {
  const droneData = drones;

  return (
    <div className="flex justify-center items-center flex-col w-full">
      <div className="grid grid-cols-2 justify-center items-center gap-20 mb-10">
        <h1 className="text-center text-6xl font-semibold">Dine Droner</h1>
        <Button onClick={() => router.push("inspeksjoner/create")}>
          Opprett en inspeksjon
        </Button>
      </div>
      <div className="justify-normal items-center flex gap-6 flex-wrap">
        {droneData.map((drone) => (
          <Card key={drone.id} className="min-w-56 w-56 min-h-56">
            <CardHeader>
              <CardTitle>{drone.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 grid-rows-2 items-center">
              <TelloDrone size={50} />
              <div className="grid grid-cols-2 grid-rows-2 gap-x-3 items-center">
                <P>Status:</P>
                <span
                  style={{
                    background: drone.isConnected ? "green" : "red",
                  }}
                  className="rounded-full w-3 h-3"
                ></span>
                <P>Temp:</P>
                <P
                  color={
                    drone.temperature < 60 && drone.isConnected
                      ? "green"
                      : "red"
                  }
                >
                  {`${drone.isConnected ? drone.temperature : " - "} C`}
                </P>
                <P>Batteri:</P>
                <P
                  color={
                    drone.batteryPercentage > 50 && drone.isConnected
                      ? "green"
                      : "red"
                  }
                >
                  {`${drone.isConnected ? drone.batteryPercentage : " - "} %`}
                </P>
              </div>
              <div>
                <P className=" text-gray-500">Siste insp:</P>
                <P className=" text-gray-500 font-semibold">
                  {format(drone.lastUsed, "EE/MM/yy")}
                </P>
                <P className=" text-gray-500 font-semibold">
                  {format(drone.lastUsed, "k:m")}
                </P>
              </div>
              <div>
                <P>Lokasjon:</P>
                <P className="font-bold">{drone.buildingArea}</P>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default Droner;
