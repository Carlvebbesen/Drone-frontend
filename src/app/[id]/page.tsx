import { DetensionFirebase, getDetensions } from "@/lib/firebase/readData";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

import { InspectionValid } from "@/components/form/inspectionValid";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { fireStorageInstance } from "@/lib/firebase/config";
import { getDownloadURL, ref } from "firebase/storage";
import Image from "next/image";

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


const DetensionView = async ({
  searchParams,
  params,
}: {
  searchParams: { detensionid: string };
  params: { id: string };
}) => {
  console.log("Search Params", searchParams);
  const detensions = (await getDetensions({
    inspectionId: params.id,
    countOnly: false,
  })) as DetensionFirebase[];
  const detension = detensions.find((item) => item.id === searchParams.detensionid);
  if (!detension) {
    return (
      <div className="flex justify-center items-center">
        <h1 className="text-3xl text-gray-500 font-bold">Velg et avvik</h1>
      </div>
    );
  }
  return (
    <div className="col-span-4 w-full px-32">
      <Carousel>
        <CarouselContent>
          {detension.findings.map(async (item) => {
            const url = await getDownloadURL(
              ref(fireStorageInstance, item.imgId)
            );
            return (
              <Image
                alt="avviks-bilde"
                width={500}
                height={500}
                key={item.id}
                src={url}
              />
            );
          })}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
      <Card className="p-6">
        <CardTitle className="text-2xl font-semibold text-gray-600">
          Det ble funnet følgende avvik:
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
