"use client";

import { InspectionMap } from "@/components/maps/mazeMapWrapper";
import { MazemapPos, PoiProps, RouteProps } from "@/components/maps/mapUtils";
import { Button } from "@/components/ui/button";
import { SetStateAction, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloorObject, realfagsByggetFloors } from "@/lib/dummData";
import { a3Route, thirdFloorRoute } from "@/lib/inspectionRoutes";

const Kart = () => {
  const [route, setRoute] = useState<{ pos: MazemapPos }[]>([]);
  
  return (
    <div>
      <Select
        onValueChange={(value) =>
          setSelectedFloor(
            realfagsByggetFloors.filter(
              (floor) => floor.properties.id === parseInt(value)
            )[0]
          )
        }
        defaultValue={selectedFloor.properties.id.toString()}
      >
        <SelectTrigger>
          <SelectValue placeholder={"Velg etasje"} />
        </SelectTrigger>
        <SelectContent>
          {realfagsByggetFloors.map((item) => (
            <SelectItem
              key={item.properties.id}
              value={item.properties.id.toString()}
            >
              {item.properties.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <InspectionMap
        className="w-[500px] h-[500px]"
        heatMap={{
          type: "FeatureCollection",
          features: [
            ...thirdFloorRoute.map((route) => [
              route.pos.lngLat.lng,
              route.pos.lngLat.lat,
            ]),
            ...a3Route.map((route) => [
              route.pos.lngLat.lng,
              route.pos.lngLat.lat,
            ]),
          ].map((point) => {
            return {
              type: "Feature",
              properties: {
                dbh: (Math.random() * 10).toFixed(0),
              },
              geometry: {
                type: "Point",
                coordinates: point,
              },
            };
          }),
        }}
        onRoute={({
          route,
          roomDimension,
          drone,
        }: {
          route: RouteProps;
          roomDimension: PoiProps;
          drone: { pos: MazemapPos; id: string };
        }) => console.log("Heii på deg ruten er laget")}
        showDrones={false}
        routePoints={route}
        setRoutePoints={setRoute}
        allFloors={realfagsByggetFloors}
        setLoading={setLoading}
        dronePositions={[]}
        zLevel={selectedFloor.properties.z}
      />
      <Button
        onClick={() => {
          console.log(route);
          setRoute([]);
        }}
      >
        Reset route
      </Button>
    </div>
  );
};
export default Kart;
