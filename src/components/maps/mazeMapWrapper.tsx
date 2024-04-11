"use client";

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import useScript from "react-script-hook";
import { MazemapPos, BlueDot, RouteProps, PoiProps, LngLat } from "./mapUtils";
import { ConvertedFormatTrippel, revertToTrippelNestedList } from "@/lib/utils";

declare global {
  let Mazemap: any;
}
interface MapWrapperProps {
  heatMap?: any;
  showFloorLayer?: boolean;
  destroyOldDots?: boolean;
  zoom?: number;
  center?: LngLat;
  onRoute?: ({
    route,
    roomDimension,
    drone,
  }: {
    route: RouteProps;
    roomDimension: PoiProps;
    drone: { pos: MazemapPos; id: string };
  }) => void;
  showDrones?: boolean;
  routePoints?: { pos: MazemapPos }[];
  setRoutePoints?: Dispatch<SetStateAction<{ pos: MazemapPos }[]>>;
  allFloors: {
    name: string;
    zLevel: number;
    id: number;
    geometry: {
      type: string;
      coordinates: ConvertedFormatTrippel["coordinates"];
    };
  }[];
  zLevel: number;
  showDots?: boolean;
  className?: string;
  setLoading?: Dispatch<SetStateAction<boolean>>;
  dronePositions?: { pos: MazemapPos; id: string }[];
  displayInspection?: boolean;
  setRoomsClicked?: Dispatch<SetStateAction<PoiProps[]>>;
}

export const MazeMapWrapper = ({
  onRoute,
  zoom = 19,
  center = { lng: 10.405510225389492, lat: 63.41556139549505 },
  dronePositions = [],
  className,
  setLoading,
  routePoints = [],
  destroyOldDots = false,
  displayInspection = false,
  setRoutePoints,
  setRoomsClicked,
  showDrones = false,
  allFloors,
  zLevel,
  heatMap,
  showDots = false,
  showFloorLayer = false,
}: MapWrapperProps) => {
  const myMapRef = useRef<any>();
  const lastDotRef = useRef<BlueDot>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading] = useScript({
    src: "https://api.mazemap.com/js/v2.0.114/mazemap.min.js",
  });
  const routeControllerRef = useRef<any>();
  const addFloorLayer = () => {
    myMapRef.current.addLayer({
      id: "custom-floor-fill",
      type: "fill",
      source: {
        type: "geojson",
        data: null,
      },
      paint: {
        // "fill-outline-color": "#fc0",
        "fill-color": "#ADDFFF",
        "fill-opacity": 0.5,
      },
    });
  };

  const addHeatMap = () => {
    if (heatMap) {
      myMapRef.current.addSource("heatpoints", {
        type: "geojson",
        data: heatMap,
      });
      myMapRef.current.addLayer({
        id: "heatpoints",
        type: "heatmap",
        source: "heatpoints",
        maxzoom: 18,
        paint: {
          // Increase the heatmap weight based on frequency and property magnitude
          "heatmap-weight": 1,
          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            16,
            0.2,
            22,
            1,
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparancy color
          // to create a blur-like effect.
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,255,0)",
            0.2,
            "#1FAFFC",
            0.4,
            "#5BD76F",
            0.6,
            "#FFE61E",
            0.8,
            "#FF7B00",
            1,
            "#FF3333",
          ],
          // Adjust the heatmap radius by zoom level
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            5,
            22,
            30,
          ],
          "heatmap-opacity": 0.8,
        },
      });
    }
  };

  const findClosestDrone = async (pos: MazemapPos) => {
    const distances = await Promise.all(
      dronePositions.map(async (drone) => {
        const route: RouteProps = await Mazemap.Data.getRouteJSON(
          drone.pos,
          pos
        );
        return {
          drone: drone,
          route: route,
        };
      })
    );
    return distances.reduce((prev, current) => {
      return prev.route.properties.pathMetrics.distanceWalkingMeters <
        current.route.properties.pathMetrics.distanceWalkingMeters
        ? prev
        : current;
    });
  };
  const displayInspectionRoute = async () => {
    let counter = 1;
    while (counter < routePoints.length) {
      const route: RouteProps = await Mazemap.Data.getRouteJSON(
        routePoints[counter - 1],
        routePoints[counter]
      );
      routeControllerRef.current.setPath(route);
      const bounds = Mazemap.Util.Turf.bbox(route);
      myMapRef.current.fitBounds(bounds, { padding: 100 });
    }
  };

  const generateRoute = async (pos: MazemapPos, room: PoiProps) => {
    if (onRoute) {
      const closestDrone = await findClosestDrone(pos);
      createDot(
        closestDrone.drone.pos.lngLat,
        closestDrone.drone.pos.zLevel,
        false
      );
      // room.geometry.coordinates[0].forEach((item) => {
      //   createDot({ lng: item[0], lat: item[1] }, 1, true);
      // });
      newPath(closestDrone);
      onRoute({
        route: closestDrone.route,
        roomDimension: room,
        drone: closestDrone.drone,
      });
    }
  };
  const updateClickedPos = async (
    lngLat: MazemapPos["lngLat"],
    zLevel: number
  ) => {
    const dotRef = createDot(lngLat, zLevel, true);
    destroyOldDots && lastDotRef.current?.destroy();
    lastDotRef.current = dotRef;
    await highlightRoom({ lngLat: lngLat, zLevel: zLevel });
    setRoutePoints &&
      setRoutePoints((prev) => [...prev, { pos: { lngLat, zLevel } }]);
  };
  const newPath = (closestDrone: {
    drone: {
      pos: MazemapPos;
      id: string;
    };
    route: RouteProps;
  }) => {
    routeControllerRef.current.clear();
    routeControllerRef.current.setPath(closestDrone.route);
    const bounds = Mazemap.Util.Turf.bbox(closestDrone.route);
    myMapRef.current.fitBounds(bounds, { padding: 100 });
  };

  const createDot = (
    lngLat: { lng: number; lat: number },
    zLevel: number,
    isClick: boolean
  ) => {
    return new Mazemap.BlueDot({
      map: myMapRef.current,
      color: isClick ? "red" : "#0000FF",
    })
      .setLngLat(lngLat)
      .setZLevel(zLevel)
      .setAccuracy(1)
      .show();
  };
  const highlightRoom = async ({ lngLat, zLevel }: MazemapPos) => {
    const poi: PoiProps = await Mazemap.Data.getPoiAt(lngLat, zLevel);
    myMapRef.current.highlighter.highlight(poi);
    return poi;
  };
  const redrawFloorPlans = () => {
    const zLevel = myMapRef.current.getZLevel();
    if (myMapRef.current.getSource("custom-floor-fill")) {
      myMapRef.current.getSource("custom-floor-fill").setData({
        type: "FeatureCollection",
        features: allFloors
          .filter((item) => item.zLevel === zLevel)
          .map((floor) => {
            return {
              type: "Feature",
              properties: {
                buildingId: 67,
                campusId: 1,
                flags: [],
                z: floor.zLevel,
                name: "Floor Fill",
                id: floor.id,
              },
              geometry: {
                type: "Polygon",
                coordinates: revertToTrippelNestedList(
                  floor.geometry.coordinates
                ).coordinates,
              },
            };
          }),
      });
    }
  };

  const onMapClick = async (e: any) => {
    setLoading && setLoading(true);
    let zLevel = myMapRef.current.zLevel;
    showDots && updateClickedPos(e.lngLat, zLevel);
    if (showDots) {
      const room = await highlightRoom({
        lngLat: e.lngLat,
        zLevel: zLevel,
      });

      generateRoute(e.lngLat, room);
      setRoomsClicked && setRoomsClicked((prev) => [...prev, room]);
    }
    setLoading && setLoading(false);
  };

  const onLoad = async (): Promise<void> => {
    //initialize the highlighter

    myMapRef.current.highlighter = new Mazemap.Highlighter(myMapRef.current, {
      showOutline: true, // optional
      showFill: true, // optional
      outlineColor: Mazemap.Util.Colors.MazeColors.MazeBlue, // optional
      fillColor: Mazemap.Util.Colors.MazeColors.MazeBlue, // optional
    });
    //initialize the route controller
    routeControllerRef.current = new Mazemap.RouteController(myMapRef.current, {
      routeLineColorPrimary: "#0099EA",
      routeLineColorSecondary: "#888888",
      showDirectionArrows: true,
    });
    if (dronePositions.length > 0 && showDrones) {
      dronePositions.forEach((drone) =>
        createDot(drone.pos.lngLat, drone.pos.zLevel, false)
      );
    }
    heatMap && addHeatMap();
    showFloorLayer && addFloorLayer();
    displayInspection && (await displayInspectionRoute());
    setLoaded(true);
  };

  useEffect(() => {
    if (loaded) {
      myMapRef.current.setZLevel(zLevel);
    }
  }, [loaded, zLevel]);

  useEffect(() => {
    if (!loading) {
      myMapRef.current = new Mazemap.Map({
        campuses: 1,
        container: "mazemap-container",
        zLevel: 5,
        center: center,
        zoom: zoom,
        doubleClickZoom: false,
        touchZoomRotate: false,
        zLevelControl: false,
        hash: true,
      });
      myMapRef.current.addControl(new Mazemap.mapboxgl.NavigationControl());
      myMapRef.current.on("click", onMapClick);
      // myMapRef.current.on("rotate", onRotate);
      myMapRef.current.on("load", onLoad);
      myMapRef.current.on("zlevel", redrawFloorPlans);
    }

    return undefined;
  }, [loading]);

  return (
    <div className={className}>
      <link
        rel="stylesheet"
        href="https://api.mazemap.com/js/v2.0.114/mazemap.min.css"
      ></link>
      <div id="mazemap-container" className={"w-full h-full"} />
    </div>
  );
};
