"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { SelectForm } from "@/components/form/selectForm";
import { DateForm } from "@/components/form/dateForm";
import { MapProps, MazeMapWrapper } from "@/components/maps/mazeMapWrapper";
import { Button } from "./ui/button";
import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { BuildingAreaFirebase } from "@/lib/dataTypes";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useEffect, useState } from "react";

import { createMission } from "@/lib/firebase/createData";

export const taskEnum = z.enum([
  "Inspeksjon av Nødutgang/Rømmningsvei",
  "Inspeksjon av Støv",
  "Generell Rom",
  "Inspeksjon skader",
  "Inspeksjon av Tak",
]);
const CreateInspection = ({
  floorNames,
}: {
  floorNames: {
    name: string;
    zLevel: number;
    id: number;
  }[];
}) => {
  const { mutateWithToast } = useMutationWithToast();
  const [areas, setAreas] = useState<BuildingAreaFirebase[]>([]);
  const [generatedImage, setGeneratedImage] = useState<MapProps | null>(null);
  const fetchAreas = async () => {
    const buildingAreas = (
      await getDocs(collection(db, "buildingArea"))
    ).docs.map((item) => {
      return { ...(item.data() as BuildingAreaFirebase), id: item.id };
    });
    setAreas(buildingAreas);
  };

  useEffect(() => {
    fetchAreas();
    console.log("fetching areas");
  }, []);
  const formSchema = z
    .object({
      type: taskEnum,
      date: z.date(),
      område: z.string().min(1),
      floor: z.string().min(1),
    })
    .required();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: taskEnum.Values["Inspeksjon av Nødutgang/Rømmningsvei"],
      date: new Date(),
      område: "L3efsOXfN3FUE8WTwxKu",
      floor: "383",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (generatedImage === null) return console.error("No image generated");
    await createMission(generatedImage, values);
    mutateWithToast({
      mutatePromise: new Promise((resolve) =>
        setTimeout(() => {
          resolve(true);
        }, 500)
      ),
      textObj: {
        actionType: "create",
        singularForm: "Inspeksjon",
        pluralForm: "Inspeksjonen",
      },
    });
  }
  const area = form.watch("område");
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-6"
      >
        <div>
          <h1 className="text-2xl font-bold my-6">Inspiser et område:</h1>
          <SelectForm
            form={form}
            name="type"
            label={"Type inspeksjon"}
            placeholder={"Velg typen inspeksjon"}
            items={taskEnum.options.map((item) => {
              return { value: item, label: item };
            })}
            desc={"Dette er typen inspeksjon dronen vil utføre"}
          />
          <SelectForm
            form={form}
            name="floor"
            label={"Etasje"}
            items={floorNames
              .sort((a, b) => b.zLevel - a.zLevel)
              .map((item) => {
                return { label: item.name, value: item.id.toString() };
              })}
            placeholder={""}
            desc={""}
          />
          <SelectForm
            form={form}
            name="område"
            label={"Området"}
            placeholder={""}
            items={areas
              .filter(
                (item) => item.floorId === parseInt(form.getValues("floor"))
              )
              .map((item) => {
                return { value: item.id, label: item.name };
              })}
            desc={"Dette er typen inspeksjon dronen vil utføre"}
          />
          <DateForm
            form={form}
            name={"date"}
            label={"Dato"}
            placeholder={"Velg dato"}
            desc={"Dette er når dronen vil utføre oppdraget"}
          />
          <Card className="p-4 w-full mt-4">
            <CardTitle>Send instruksjonene:</CardTitle>
            <CardDescription>
              Send avgårde informasjonen til dronen
            </CardDescription>
            <CardContent className="flex justify-center gap-10 items-center mt-5 flex-col">
              <Button size={"lg"} type="submit">
                Submit
              </Button>
              <div>
                <h5 className="font-bold text-xl">Info:</h5>
                <p className="text-md">
                  Følgene kriterier følges mtp når på døgnet inspeksjonen
                  utføres:
                </p>
                <ul>
                  <li
                    className="font-sem
                    old text-gray-500 text-sm"
                  >
                    - Dronen er tilgjengelig
                  </li>
                  <li className="font-semibold text-gray-500 text-sm">
                    - Dronen har batteri og ingen skader
                  </li>
                  <li className="font-semibold text-gray-500 text-sm">
                    - Det er på en tid på døgnet hvor det er få mennesker
                  </li>
                  <li className="font-semibold text-gray-500 text-sm">
                    - Det er lovlig tid å fly drone på
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="p-4">
          <CardTitle>Inspeksjonsområde for dronen:</CardTitle>
          <CardContent className="mt-8">
            <MazeMapWrapper
              generateMap={(values) => {
                if (values.mapArea !== generatedImage?.mapArea)
                  setGeneratedImage((_) => values);
              }}
              overlayTransparancy={1}
              zLevel={
                floorNames.find(
                  (item) => item.id === parseInt(form.getValues("floor"))
                )?.zLevel ?? 3
              }
              className="h-[720px] w-[720px]"
              selectedArea={areas.find((item) => item.id === area)}
            />
          </CardContent>
        </Card>
      </form>
      <canvas className="h-[720px] w-[720px] hidden" id="canvasId">
        Canvas for donwload locally
      </canvas>
    </Form>
  );
};

export default CreateInspection;
