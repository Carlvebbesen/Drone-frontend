import { Dashboard } from "@/components/dashboard/dashboard";
import { getBuilding } from "@/lib/firebase/readData";

export default async function Home() {
  const buildingName = "Realfagsbygget";
  const building = await getBuilding(buildingName);
  return <Dashboard building={building} />;
}
