import {
  DetensionFirebase,
  getBuildingArea,
  getDetensions,
  getDrones,
  getInspection,
} from "@/lib/firebase/readData";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

import { InspectionValid } from "@/components/form/inspectionValid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { fireStorageInstance } from "@/lib/firebase/config";
import { getDownloadURL, ref } from "firebase/storage";
import Image from "next/image";
import { format } from "date-fns";
import { MazeMapWrapper } from "@/components/maps/mazeMapWrapper";

const transelateObject: { [index: string]: string } = {
  chair: "Stol",
  refrigerator: "Kjøleskap",
  cup: "Glass",
  "fire hydrant": "Brannslukningsapperat",
  bottle: "Flaske",
  bench: "Benk",
  backpack: "Ryggsekk",
  handbag: "Bag",
  suitcase: "Koffert",
  couch: "Sofa",
  "dining table": "Bord",
  tv: "Tv",
  sink: "Vask",
};
const months: { [index: number]: string } = {
  0: "januar",
  1: "februar",
  2: "mars",
  3: "april",
  5: "mai",
  6: "juni",
  7: "juli",
  8: "august",
  9: "september",
  10: "oktober",
  11: "november",
  12: "desember",
};

const DetensionView = async ({
  searchParams,
  params,
}: {
  searchParams: { detensionid: string };
  params: { id: string };
}) => {
  const inspection = await getInspection(params.id);
  const buildingArea = await getBuildingArea({
    buildingArea: inspection.buildingAreaId,
  });
  const drones = await getDrones();
  const detensions = (await getDetensions({
    inspectionId: params.id,
    countOnly: false,
  })) as DetensionFirebase[];
  const detension = detensions.find(
    (item) => item.id === searchParams.detensionid
  );
  if (detensions.length === 0) {
    return <div></div>;
  }
  if (!detension) {
    return (
      <div className="flex justify-center items-center px-24">
        <h1 className="text-3xl text-gray-500 font-bold">Velg et avvik</h1>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 auto-rows-auto items-start">
      <div className="px-20">
        <Carousel>
          <CarouselContent>
            {detension.findings.map(async (item) => {
              const url = await getDownloadURL(
                ref(fireStorageInstance, item.imgId)
              );
              return (
                <CarouselItem key={item.id}>
                  <Image
                    alt="avviks-bilde"
                    width={600}
                    height={600}
                    src={url}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselNext />
          <CarouselPrevious />
        </Carousel>
      </div>
      <MazeMapWrapper
        className="h-full min-h-[600px]"
        selectedArea={buildingArea}
        zLevel={buildingArea.rooms[0].properties.zLevel}
        zoom={16}
        allDrones={drones.map((item) => {
          return {
            pos: item.location,
            buildingAreaId: item.buildingAreaId,
            id: item.id,
          };
        })}
        center={{ lat: 63.41559, lng: 10.4058 }}
      />
      <Card className="pt-6 px-6 col-span-2">
        <CardTitle>
          <h1 className="text-2xl font-semibold text-gray-600">
            Det ble funnet følgende avvik:
          </h1>
          <p className="text-lg font-normal text-black">
            Klokken:{" "}
            {format(
              new Date(
                inspection.date.seconds * 1000 +
                  (detension.findings[0].frame / 25) * 1000
              ),
              "HH:mm:s"
            )}{" "}
            den{" "}
            {new Date(
              inspection.date.seconds * 1000 +
                (detension.findings[0].frame / 25) * 1000
            ).getDate()}
            {". "}
            {
              months[
                new Date(
                  inspection.date.seconds * 1000 +
                    (detension.findings[0].frame / 25) * 1000
                ).getMonth()
              ]
            }
          </p>
        </CardTitle>
        <CardContent className="w-full grid grid-cols-2 gap-x-11 justify-center items-center">
          <div>
            <p>
              Under inspeksjonen ble det funnet følgende gjenstander som
              blokkerer nødutganger eller rømningsveier:
            </p>
            <li>
              {
                new Set(
                  detension.findings
                    .map((item) =>
                      Object.values(item.detensions).map(
                        (det) => transelateObject[det.name] ?? det.name
                      )
                    )
                    .flat()
                )
              }
            </li>
          </div>
          <InspectionValid isValid={detension.isValid} id={detension.id} />
        </CardContent>
        <CardFooter>
          Modellen som ble brukt er{" "}
          {(
            Math.max(
              ...detension.findings
                .map((m) =>
                  Object.values(m.detensions).map((item) => item.conf)
                )
                .flat()
            ) * 100
          ).toFixed(0)}{" "}
          % sikker på gjenstanden som ble funnet
        </CardFooter>
      </Card>
    </div>
  );
};

export default DetensionView;
