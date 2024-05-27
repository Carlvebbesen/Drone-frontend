"use client";

import { useMutationWithToast } from "@/hooks/useMutationWithToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "../ui/form";
import { SwitchForm } from "./switchForm";
import { Card, CardContent, CardDescription } from "../ui/card";
import { Switch } from "../ui/switch";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { cn } from "@/lib/utils";

export const InspectionValid = ({
  isValid,
  id,
}: {
  isValid: boolean;
  id: string;
}) => {
  const { mutateWithToast } = useMutationWithToast();
  const [valid, setValid] = useState<boolean>(isValid);

  const changeValue = (val: boolean) => {
    mutateWithToast({
      mutatePromise: new Promise(async (resolve) => {
        await updateDoc(doc(db, "deviation", id), { isValid: val });
        resolve(true);
      }),
      textObj: {
        actionType: "update",
        singularForm: "Avviket",
        pluralForm: "Avviket",
      },
    });
  };
  useEffect(() => setValid(isValid), [isValid]);
  return (
    <Card className="p-3 w-96 place-self-end">
      <CardContent className="flex justify-between items-center">
        <div>
          <CardDescription className="text-black text-lg">
            Er dette avviket korrekt?
          </CardDescription>
          <p className="text-sm text-slate-500 ">
            Huk av for å markere dette som en feil
          </p>
          <p
            className={cn("text-xs", valid ? "text-green-600" : "text-red-600")}
          >
            Nåværende status: {valid ? "Gyldig" : "Feil registrert"}
          </p>
        </div>
        <Switch
          checked={valid}
          onCheckedChange={(val) => {
            setValid(val);
            changeValue(val);
          }}
        />
      </CardContent>
    </Card>
  );
};
