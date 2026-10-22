import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CameraCapture from "./camera-capture";
import { SESSION_COOKIE } from "@/lib/session";

export default async function CameraPage() {
  if (!(await cookies()).get(SESSION_COOKIE)?.value) redirect("/login");
  return <CameraCapture />;
}
