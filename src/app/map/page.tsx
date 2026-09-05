import { getSession } from "@/lib/auth";
import BikeMap from "./BikeMap";

export default async function MapPage() {
  const session = await getSession(); // middleware guarantees one here
  return <BikeMap userName={session?.name ?? "there"} />;
}
