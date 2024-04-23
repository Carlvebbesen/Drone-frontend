import { TelloDrone } from "@/components/logo/telloDrone";
import {
  DetensionFirebase,
  getBuildingArea,
  getDetensions,
  getInspection,
} from "@/lib/firebase/readData";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { MenuDetension } from "./menu";

const InspectionPage = async ({
  params,
  children,
}: {
  children: React.ReactNode;
  params: {
    id: string;
    detension: string;
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
  const detensions = (await getDetensions({
    inspectionId: id,
    countOnly: false,
  })) as DetensionFirebase[];
  return (
    <div>
      <h1 className="text-3xl font-bold mb-5 underline">
        Inspeksjon av: {buildArea.name},{" "}
        {format(new Date(inspection.date.seconds * 1000), "d.LLL")} kl:{" "}
        {format(new Date(inspection.date.seconds * 1000), "HH:mm")}
      </h1>
      <p>Totalt antall avvik:{detensions.length}</p>
      <div className="grid grid-cols-5 h-full">
        {detensions.length === 0 ? (
          <div className="col-start-2 col-span-3 font-bold text-xl mt-40">
            Det ble ikke funnet noen avvik under denne inspeksjonen,
            rømningsveier og nødutganger kan derfor ansees som frie
          </div>
        ) : (
          <>
            <MenuDetension detensions={detensions} />
            {children}
          </>
        )}
      </div>
    </div>
  );
};

export default InspectionPage;
