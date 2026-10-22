import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";
import ChangePasswordForm from "./change-password-form";

export default async function ChangePasswordPage() {
  if (!(await cookies()).get(SESSION_COOKIE)?.value) redirect("/login");
  return <ChangePasswordForm />;
}
