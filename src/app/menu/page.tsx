import { connection } from "next/server";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";

export default async function MenuPage() {
  await connection();
  return <MaintenanceScreen />;
}
