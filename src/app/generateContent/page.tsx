import { AddDataView } from "@/components/addDataView";
import { getBuilding, getDrones } from "@/lib/firebase/readData";

const Page = async () => {
  const buildingName = "Realfagsbygget";
  const building = await getBuilding(buildingName);
  return <AddDataView building={building} />;
};
export default Page;
