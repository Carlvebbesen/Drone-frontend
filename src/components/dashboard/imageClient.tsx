"use client";

import { fireStorageInstance } from "@/lib/firebase/config";
import { getDownloadURL, ref } from "firebase/storage";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { DetensionFirebase } from "@/lib/firebase/readData";
import Image from "next/image";

export const ImageClient = ({
  detension,
}: {
  detension: DetensionFirebase;
}) => {
  console.log(detension);
  console.log(
    getDownloadURL(ref(fireStorageInstance, detension.findings[0].imgId))
  );
  return (
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
  );
};
