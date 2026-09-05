import { getSession } from "@/lib/auth";
import Dashboard from "./Dashboard";

export default async function Home() {
  const session = await getSession(); // middleware guarantees a session here
  return <Dashboard userName={session?.name ?? "there"} />;
}
