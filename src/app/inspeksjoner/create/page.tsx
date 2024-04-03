"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SelectForm } from "@/components/form/selectForm";
import { SwitchForm } from "@/components/form/switchForm";
import { DateForm } from "@/components/form/dateForm";
import { InputForm } from "@/components/form/inputForm";

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
      path: z.array(z.object({ lat: z.number(), long: z.number() })),
      droneId: z.string(),
      oneTimeInspection: z.boolean(),
    })
    .required()
    .refine(
      (data) => {
        if (data.endDate) {
          return data.endDate > data.startDate;
        }
        return false;
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
      path: [],
      droneId: "123",
      oneTimeInspection: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }
  const isOneTime = form.watch("oneTimeInspection") ?? false;
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-3 gap-6 grid-flow-row"
        >
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

          <Card className="p-4">
            <CardTitle>Info:</CardTitle>
            <CardContent className="pb-2">
              <p className="text-md">
                Følgene kriterier følges mtp når på døgnet inspeksjonen utføres:
              </p>
              <ul>
                <li className="font-semibold text-gray-500 text-sm">
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
            </CardContent>
          </Card>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateInspections;
