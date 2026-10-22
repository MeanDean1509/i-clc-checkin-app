import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "./dashboard-shell";
import { decodeSessionUser, SESSION_COOKIE, SESSION_USER_COOKIE } from "@/lib/session";

export default async function DashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = decodeSessionUser((await cookies()).get(SESSION_USER_COOKIE)?.value);
  if (!token || !user) redirect("/login");
  return <DashboardShell userName={user.name || user.username} />;
}
