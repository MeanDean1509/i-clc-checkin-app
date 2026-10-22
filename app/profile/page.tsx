import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSessionUser, SESSION_COOKIE, SESSION_USER_COOKIE } from "@/lib/session";
import ProfileCard from "./profile-card";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const user = decodeSessionUser(cookieStore.get(SESSION_USER_COOKIE)?.value);
  if (!cookieStore.get(SESSION_COOKIE)?.value || !user) redirect("/login");
  return <ProfileCard user={user} />;
}
