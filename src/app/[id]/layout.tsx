import { TelloDrone } from "@/components/logo/telloDrone";
import {
  deviationFirebase,
  getBuildingArea,
  getdeviations,
  getInspection,
} from "@/lib/firebase/readData";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { Menudeviation } from "./menu";

const InspectionPage = async ({
  params,
  children,
}: {
  children: React.ReactNode;
  params: {
    id: string;
    deviation: string;
    [key: string]: string | undefined;
  };
}) => {
  const id = params.id as string | undefined;
  if (!id) {
    console.log("Redirecting");
    redirect("/");
  }
  const inspection = await getInspection(id);
  const buildArea = await getBuildingArea({
    buildingArea: inspection.buildingAreaId,
  });
  const deviations = (await getdeviations({
    inspectionId: id,
    countOnly: false,
  })) as deviationFirebase[];
  return (
    <div className="h-full px-10 flex-grow">
      <h1 className="text-3xl font-bold my-5 underline">
        Inspeksjon av: {buildArea.name},{" "}
        {format(new Date(inspection.date.seconds * 1000), "d.LLL")} kl:{" "}
        {format(new Date(inspection.date.seconds * 1000), "HH:mm")}
      </h1>
      <p className="text-lg font-semibold mb-5">
        Totalt antall avvik funnet:{deviations.length}
      </p>
      <div className="flex">
        {deviations.length === 0 && (
          <div className="font-bold text-xl mt-40 w-full text-center">
            Det ble ikke funnet noen avvik under denne inspeksjonen,
            rømningsveier og nødutganger kan derfor ansees som frie
          </div>
        )}
        {deviations.length > 0 && (
          <Menudeviation
            inspectionTime={inspection.date.seconds}
            deviations={deviations}
          />
        )}
        {children}
      </div>
    </div>
  );
};

export default InspectionPage;
