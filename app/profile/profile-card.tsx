"use client";

import { useRouter } from "next/navigation";
import AppNav from "@/app/components/app-nav";
import type { SessionUser } from "@/lib/session";
import Link from "next/link";
import { History, KeyRound, LogOut } from "lucide-react";

export default function ProfileCard({ user }: { user: SessionUser }) {
  const router = useRouter();
  const details = [["Username", user.username], ["Phone", user.phone || "Not available"], ["Email", user.email || "Not available"]];
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); router.refresh(); }
  return <main className="min-h-dvh bg-[#f8f8ff] pb-24"><section className="mx-auto max-w-[430px] px-4 py-5"><header className="rounded-[1.75rem] bg-brand p-6 text-center text-white"><div className="mx-auto grid size-20 place-items-center rounded-full border-4 border-white bg-brand-light text-3xl font-bold text-brand">{(user.name || user.username).slice(0, 1).toUpperCase()}</div><h1 className="mt-3 text-2xl font-bold">{user.name || user.username}</h1><span className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand">{user.userRole || "Member"}</span></header><section className="mt-4 rounded-[1.375rem] bg-white p-5 shadow-sm"><h2 className="font-bold">Personal information</h2><dl className="mt-3 divide-y divide-zinc-100">{details.map(([label, value]) => <div key={label} className="py-3"><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</dt><dd className="mt-1 font-medium text-zinc-800">{value}</dd></div>)}</dl></section><section className="mt-4 rounded-[1.375rem] bg-white p-5 shadow-sm"><h2 className="font-bold">Account</h2><div className="mt-3 grid gap-3"><Link href="/history" className="flex items-center gap-2 rounded-xl bg-brand-light px-4 py-3 font-semibold text-brand"><History size={18} aria-hidden="true" />Check-in History</Link><Link href="/change-password" className="flex items-center gap-2 rounded-xl border border-brand px-4 py-3 font-semibold text-brand"><KeyRound size={18} aria-hidden="true" />Change Password</Link><button onClick={logout} className="flex items-center gap-2 rounded-xl border border-red-600 px-4 py-3 text-left font-semibold text-red-700"><LogOut size={18} aria-hidden="true" />Sign Out</button></div></section></section><AppNav active="profile" /></main>;
}
