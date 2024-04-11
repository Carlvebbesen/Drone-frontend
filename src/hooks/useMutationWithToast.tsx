"use client";

import { firstLetterUppercase } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface SimpleText {
  singularForm: string;
  pluralForm: string;
  actionType: "create" | "update" | "delete" | "read";
}

export interface MutationWithToastProps {
  mutatePromise: Promise<unknown>;
  textObj: SimpleText;
}

export const useMutationWithToast = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const actionObject = {
    create: { v1: "Oppretter", v2: "opprettelse" },
    update: { v1: "Oppdaterer", v2: "oppdatering" },
    delete: { v1: "Sletter", v2: "sletting" },
    read: { v1: "Henter", v2: "hentet" },
  };
  const mutateWithToast = ({
    mutatePromise,
    textObj,
  }: MutationWithToastProps) => {
    setLoading(true);
    toast.promise(mutatePromise, {
      loading: `${actionObject[textObj.actionType]["v1"]} ${firstLetterUppercase(
        textObj.singularForm
      )}...`,
      success: () => {
        setLoading(false);
        return `Vellykket ${
          actionObject[textObj.actionType]["v2"]
        } av ${firstLetterUppercase(textObj.pluralForm)}!`;
      },
      error: () => {
        setLoading(false);
        return `En feil oppstod under ${
          actionObject[textObj.actionType]["v2"]
        } av ${firstLetterUppercase(textObj.singularForm)}. Prøv igjen.`;
      },
    });
  };
  return { mutateWithToast, loading };
};
