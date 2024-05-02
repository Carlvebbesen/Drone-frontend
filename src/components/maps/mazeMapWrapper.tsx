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
import { BuildingAreaFirebase } from "@/lib/dataTypes";
import * as turf from "@turf/turf";
declare global {
  let Mazemap: any;
}

interface MapProps {
  pixelHeight: number;
  pixelWidth: number;
  viewWidthKm: number;
  viewHeightKm: number;
  imgUrl: string;
  topLeft: number[];
  topRight: number[];
  bottomLeft: number[];
  bottomRight: number[];
  mapArea?: string;
}
interface MapWrapperProps {
  heatMap?: any;
  generateMap?: (values: MapProps) => void;
  overlayTransparancy?: number;
  destroyOldDots?: boolean;
  zoom?: number;
  center?: LngLat;
  selectedArea?: BuildingAreaFirebase | undefined;
  setPointClicked?: Dispatch<SetStateAction<MazemapPos | undefined>>;
  onRoute?: ({
    route,
    roomDimension,
    drone,
  }: {
    route: RouteProps;
    roomDimension: PoiProps;
    drone: { pos: MazemapPos; id: string };
  }) => void;
  routePoints?: { pos: MazemapPos }[];
  setRoutePoints?: Dispatch<SetStateAction<{ pos: MazemapPos }[]>>;
  allFloors?: {
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
  setLoading?: Dispatch<SetStateAction<Boolean>>;
  allDrones?: { pos: MazemapPos; id: string; buildingAreaId: string }[];
  displayInspection?: boolean;
  setRoomsClicked?: Dispatch<SetStateAction<PoiProps[]>>;
}

export const MazeMapWrapper = ({
  onRoute,
  zoom = 19,
  generateMap,
  overlayTransparancy = 0.5,
  center = { lng: 10.405510225389492, lat: 63.41556139549505 },
  allDrones = [],
  className,
  setLoading,
  selectedArea,
  setPointClicked,
  routePoints = [],
  destroyOldDots = false,
  displayInspection = false,
  setRoutePoints,
  setRoomsClicked,
  allFloors,
  zLevel,
  heatMap,
  showDots = false,
}: MapWrapperProps) => {
  const droneMarkerRef = useRef<any>();
  const myMapRef = useRef<any>();
  const lastDotRef = useRef<BlueDot>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading] = useScript({
    src: "https://api.mazemap.com/js/v2.0.114/mazemap.min.js",
  });
  const routeControllerRef = useRef<any>();
  const addFloorLayer = () => {
    if (allFloors && !myMapRef.current.getSource("custom-floor-fill")) {
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
    }
  };
  const addAreaLayer = () => {
    if (!myMapRef.current.getSource("custom-area-fill")) {
      myMapRef.current.addLayer({
        id: "custom-area-fill",
        type: "fill",
        source: {
          type: "geojson",
          data: null,
        },
        paint: {
          // "fill-color": "#4AA02C",
          "fill-color": "#D21404",
          "fill-opacity": overlayTransparancy,
        },
      });
    }
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
      allDrones.map(async (drone) => {
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
    setPointClicked && setPointClicked({ lngLat, zLevel });
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
    if (droneMarkerRef.current) {
      console.log("removing Drone");
      droneMarkerRef.current.remove();
    }
    if (myMapRef.current.getSource("custom-area-fill")) {
      console.log("removing area fill");
      //Removing the fill by passing in an empty object
      myMapRef.current.getSource("custom-area-fill").setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              buildingId: 67,
              campusId: 1,
              flags: [],
              z: -4,
              name: "Floor Fill",
              id: "randomId12213",
            },
            geometry: {
              type: "Polygon",
              coordinates: [],
            },
          },
        ],
      });
    }
    if (
      myMapRef.current.getSource("custom-floor-fill") &&
      allFloors &&
      !selectedArea
    ) {
      console.log("Updating floor");
      const bounds = new Mazemap.mapboxgl.LngLatBounds();
      myMapRef.current.getSource("custom-floor-fill").setData({
        type: "FeatureCollection",
        features: allFloors
          .filter((item) => item.zLevel === zLevel)
          .map((floor) => {
            revertToTrippelNestedList(
              floor.geometry.coordinates
            ).coordinates[0].forEach((item) => {
              bounds.extend(item);
            });
            myMapRef.current.fitBounds(bounds, { padding: 100 });
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
  const drawCanvas = () => {
    const myCanva = myMapRef.current.getCanvas();
    let canvas = document.getElementById("canvasId");
    const width = myCanva.width;
    const height = myCanva.height;
    canvas?.setAttribute("width", width);
    canvas?.setAttribute("height", height);
    //@ts-ignore
    const ctx = canvas.getContext("2d");
    const cUL = myMapRef.current.unproject([0, 0]).toArray();
    const cUR = myMapRef.current.unproject([width, 0]).toArray();
    const cLR = myMapRef.current.unproject([width, height]).toArray();
    const cLL = myMapRef.current.unproject([0, height]).toArray();
    //blue dots
    createDot({ lat: cUL[1], lng: cUL[0] }, 3, false);
    createDot({ lat: cUR[1], lng: cUR[0] }, 3, false);

    //Red dots
    createDot({ lat: cLL[1], lng: cLL[0] }, 3, true);
    createDot({ lat: cLR[1], lng: cLR[0] }, 3, true);
    const distanceWidth1 = turf.distance(cUL, cUR, "kilometers");
    const distanceWidth2 = turf.distance(cLL, cLR, "kilometers");
    const distanceHeight1 = turf.distance(cUL, cLL, "kilometers");
    const distanceHeight2 = turf.distance(cUR, cLR, "kilometers");
    console.log("Real Distance");
    console.log("height km", distanceHeight1);
    console.log("height km", distanceHeight2);
    console.log("width km", distanceWidth1);
    console.log("width km", distanceWidth2);
    console.log("pixel distance:");
    console.log("width:", width);
    console.log("height", height);
    ctx.drawImage(myCanva, 0, 0);
    const editedImage = ctx.getImageData(0, 0, width, height);
    const data = editedImage.data;
    console.log("Start editing");
    const colors = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const count = colors.get(`${r} ${g} ${b}`) ?? 0;
      colors.set(`${r} ${g} ${b}`, count + 1);
      //rgb( 210, 20, 4)
      // If the pixel is layer color, change it to white; otherwise, change it to black
      if (r === 210 && g === 20 && b === 4) {
        data[i] = 255; // Set red channel to 255 (white)
        data[i + 1] = 255; // Set green channel to 255 (white)
        data[i + 2] = 255; // Set blue channel to 255 (white)
      } else {
        data[i] = 0; // Set red channel to 200 (black)
        data[i + 1] = 0; // Set green channel to 200 (black)
        data[i + 2] = 0; // Set blue channel to 200 (black)
      }
    }
    console.log("Finished editing");
    console.log(editedImage.data.length);
    ctx.putImageData(editedImage, 0, 0);
    let canvasEdited = document.getElementById("canvasId");
    generateMap &&
      generateMap({
        bottomLeft: cLL,
        bottomRight: cLR,
        topRight: cUR,
        topLeft: cUL,
        pixelHeight: height,
        pixelWidth: width,
        viewHeightKm: distanceHeight1,
        viewWidthKm: distanceWidth1,
        //@ts-ignore
        imgUrl: canvasEdited?.toDataURL() ?? "",
        mapArea: selectedArea?.name ?? "rom",
      });
    if (canvasEdited) {
      var link = document.createElement("a");
      link.download = `telloMap-${selectedArea?.name ?? "rom"}.png`;
      //@ts-ignore
      link.href = canvasEdited.toDataURL();
      link.click();
    } else {
      console.log("Could not generate PNG");
    }
  };
  const onMapClick = async (e: any) => {
    generateMap && drawCanvas();
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
  };

  const onLoad = async (): Promise<void> => {
    //initialize the highlighter
    if (
      !myMapRef.current.getSource("mm-feature-highlight-fill") ||
      !myMapRef.current.getSource("mm-feature-highlight-outline")
    ) {
      myMapRef.current.highlighter = new Mazemap.Highlighter(myMapRef.current, {
        showOutline: true, // optional
        showFill: true, // optional
        outlineColor: Mazemap.Util.Colors.MazeColors.MazeBlue, // optional
        fillColor: Mazemap.Util.Colors.MazeColors.MazeBlue, // optional
      });
    }
    //initialize the route controller
    routeControllerRef.current = new Mazemap.RouteController(myMapRef.current, {
      routeLineColorPrimary: "#0099EA",
      routeLineColorSecondary: "#888888",
      showDirectionArrows: true,
    });
    heatMap && addHeatMap();
    allFloors && addFloorLayer();
    addAreaLayer();
    displayInspection && (await displayInspectionRoute());
    setLoaded(true);
  };

  useEffect(() => {
    if (loaded) {
      setLoading && setLoading(true);
      if (!myMapRef.current.getSource("custom-area-fill")) {
        addAreaLayer();
      }
      if (selectedArea) {
        console.log("drawing area");
        const bounds = new Mazemap.mapboxgl.LngLatBounds();
        myMapRef.current.getSource("custom-area-fill").setData({
          type: "FeatureCollection",
          features: selectedArea.rooms.map((area) => {
            revertToTrippelNestedList(
              area.geometry.coordinates
            ).coordinates[0].forEach((item) => {
              bounds.extend(item);
            });
            return {
              type: "Feature",
              properties: {
                building: area.properties.buildingId,
                campusId: 1,
                zLevel: area.properties.zLevel,
                z: area.properties.zLevel,
                name: area.properties.names.join(" "),
                id: area.properties.id,
              },
              geometry: {
                type: "Polygon",
                coordinates: revertToTrippelNestedList(
                  area.geometry.coordinates
                ).coordinates,
              },
            };
          }),
        });
        if (droneMarkerRef.current) {
          droneMarkerRef.current.remove();
        }
        if (allDrones) {
          const areaDrone = allDrones.find(
            (drone) => drone.buildingAreaId === selectedArea.id
          );
          if (areaDrone) {
            console.log("Applying drone to map");
            const options = {
              imgUrl: "/telloDrone.webp",
              imgScale: 0.8,
              color: "MazePurple",
              size: 60,
              innerCircle: false,
              innerCircleScale: 0.3,
              shape: "marker",
              zLevel: areaDrone.pos.zLevel,
            };
            droneMarkerRef.current = new Mazemap.MazeMarker(options)
              .setLngLat(areaDrone.pos.lngLat)
              .addTo(myMapRef.current);
          }
        }
        myMapRef.current.fitBounds(bounds, { padding: 100 });
      }
      setLoading && setLoading(false);
    }
  }, [selectedArea, loaded, allDrones, setLoading]);

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
        preserveDrawingBuffer: true,
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
