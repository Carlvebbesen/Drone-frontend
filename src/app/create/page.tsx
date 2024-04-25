import CreateInspection from "@/components/createAdHoc";
import { BuildingAreaFirebase } from "@/lib/dataTypes";
import { db } from "@/lib/firebase/config";
import { getBuilding } from "@/lib/firebase/readData";
import { collection, getDocs } from "firebase/firestore";

const CreateAdhoc = async () => {
  const floors = await getBuilding("Realfagsbygget");

  return (
    <div className="p-10">
      <CreateInspection floorNames={floors.floorNames} />
    </div>
  );
};

export default CreateAdhoc;
