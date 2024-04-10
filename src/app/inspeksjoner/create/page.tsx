"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { SelectForm } from "@/components/form/selectForm";
import { SwitchForm } from "@/components/form/switchForm";
import { DateForm } from "@/components/form/dateForm";
import { InputForm } from "@/components/form/inputForm";
import { InspectionMap } from "@/components/maps/mazeMapWrapper";
import { MazemapPos, PoiProps, RouteProps } from "@/components/maps/mapUtils";
import { useState } from "react";
import { drones } from "@/lib/dummData";

const taskEnum = z.enum([
  "Inspeksjon av Nødutgang",
  "Inspeksjon av Støv",
  "Generell Inspeksjon",
  "Inspeksjon skader",
]);
const frequencyEnum = z.enum([
  "Dag",
  "Uke",
  "Måned",
  "Kvartal",
  "Semester",
  "År",
]);
const CreateInspections = () => {
  const [route, setRoute] = useState<RouteProps | null>(null);
  const [highlight, setHighlight] = useState<PoiProps | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const onRouteCreation = ({
    route,
    roomDimension,
    drone,
  }: {
    route: RouteProps;
    roomDimension: PoiProps;
    drone: { pos: MazemapPos; id: string };
  }) => {
    // console.log(route);
    // console.log(roomDimension);
    // console.log(drone);
  };
  const formSchema = z
    .object({
      type: taskEnum,
      frequency: frequencyEnum,
      antallFrequency: z
        .number()
        .min(1, "Kan ikke velge negativt antall")
        .optional(),
      startDate: z.date(),
      endDate: z.date().optional(),
      Bygning: z.string(),
      oneTimeInspection: z.boolean(),
    })
    .required()
    .refine(
      (data) => {
        if (data.endDate) {
          return data.endDate > data.startDate;
        }
        return true;
      },
      {
        message: "Sluttdatoen kan ikke være før startdatoen",
        path: ["endDate"],
      }
    );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Generell Inspeksjon",
      frequency: "Uke",
      startDate: new Date(),
      Bygning: "IT-bygget",
      oneTimeInspection: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {}
  const isOneTime = form.watch("oneTimeInspection") ?? false;
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid md:grid-cols-3 gap-6 grid-flow-row grid-cols-1"
        >
          <div>
            <SelectForm
              form={form}
              name="type"
              label={"Type inspeksjon"}
              placeholder={"Velg typen inspeksjon"}
              items={taskEnum.options}
              desc={"Dette er typen inspeksjon dronen vil utføre"}
            />
            <SwitchForm
              form={form}
              name={"oneTimeInspection"}
              label={"Adhoc inspeksjon"}
              desc={"Er dette en Adhoc inspeksjon som kun skjer en gang?"}
            />
            <DateForm
              form={form}
              name={"startDate"}
              label={"Startdato"}
              placeholder={"Velg startdato"}
              desc={
                isOneTime
                  ? "Dette er når dronen vil utføre oppdraget"
                  : "Dette er første gang dronen vil utføre oppdraget."
              }
            />
            {!isOneTime && (
              <div>
                <SelectForm
                  form={form}
                  name={"frequency"}
                  label={"Hyppighet av Inspeksjonen"}
                  placeholder={"Velg hvilken hyppighet"}
                  items={frequencyEnum.options}
                  desc={"Dette er hvor ofte dronen skal utføre denne oppgaven"}
                />
                <InputForm
                  form={form}
                  name={"antallFrequency"}
                  label={"Antall ganger"}
                  inputType={"number"}
                  desc={"Antall ganger dronen skal utføre denne inspeksjonen"}
                />
                <DateForm
                  form={form}
                  name={"endDate"}
                  label={"Sluttdato"}
                  placeholder={"Velg sluttdato"}
                  desc={"Dette er siste datoen dronen vil utføre oppgaven"}
                />
              </div>
            )}
          </div>
          <Card className="p-4 col-span-2">
            <CardTitle>Velg inspeksjonsområde for dronen:</CardTitle>
            <CardContent className="mt-8">
              <InspectionMap
                className="h-96 w-full "
                dronePositions={drones.map((drone) => {
                  return { pos: drone.pos, id: drone.id };
                })}
                setLoading={setLoading}
                onRoute={({
                  route,
                  roomDimension,
                  drone,
                }: {
                  route: RouteProps;
                  roomDimension: PoiProps;
                  drone: { pos: MazemapPos; id: string };
                }) => onRouteCreation({ route, roomDimension, drone })}
              />
            </CardContent>
          </Card>
          {/* <div className="flex items-center justify-between flex-col">
            <Card className="p-4 w-full">
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
                    <li className="font-sem
                    old text-gray-500 text-sm">
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
          </div> */}
        </form>
      </Form>
    </div>
  );
};

export default CreateInspections;
