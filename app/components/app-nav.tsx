"use client";

import Link from "next/link";
import { History, UserRound, ClipboardCheck } from "lucide-react";
type AppNavProps = { active: "checkin" | "history" | "profile" };

const itemClass = (active: boolean) => active ? "font-semibold text-white" : "text-white/65";

export default function AppNav({ active }: AppNavProps) {
  return <nav className="fixed inset-x-0 bottom-0 border-t border-brand bg-brand shadow-[0_-4px_14px_rgba(102,40,114,0.2)]"><div className="mx-auto flex h-18 max-w-[430px] items-center justify-around text-sm"><Link href="/dashboard" className={`flex flex-col items-center gap-1 ${itemClass(active === "checkin")}`}><ClipboardCheck size={18} aria-hidden="true" />Check-in</Link><Link href="/history" className={`flex flex-col items-center gap-1 ${itemClass(active === "history")}`}><History size={18} aria-hidden="true" />History</Link><Link href="/profile" className={`flex flex-col items-center gap-1 ${itemClass(active === "profile")}`}><UserRound size={18} aria-hidden="true" />Profile</Link></div></nav>;
}
