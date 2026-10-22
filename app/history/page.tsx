import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";
import HistoryList from "./history-list";

export default async function HistoryPage() {
  if (!(await cookies()).get(SESSION_COOKIE)?.value) redirect("/login");
  return <HistoryList />;
}
