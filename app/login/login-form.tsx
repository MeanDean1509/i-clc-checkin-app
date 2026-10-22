"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) {
        setError("Unable to sign in. Check your credentials and try again.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#f8f8ff] px-5 py-10">
      <div className="absolute inset-x-0 top-0 h-[44%] rounded-b-[2.25rem] bg-brand" />
      <section className="relative w-full max-w-[390px] animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <div className="grid size-28 place-items-center rounded-[1.75rem] bg-white p-3 shadow-2xl shadow-black/20">
            <Image src="/images/logo-iclc.png" alt="I-CLC" width={82} height={82} priority />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-white/80">I-CLC CheckIn</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-lg bg-white p-6 shadow-xl shadow-brand/15">
          <label className="block text-sm font-medium text-zinc-700" htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" className="mt-2 h-13 w-full rounded-md border border-zinc-300 bg-white px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" required />

          <label className="mt-5 block text-sm font-medium text-zinc-700" htmlFor="password">Password</label>
          <div className="relative mt-2">
            <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="h-13 w-full rounded-md border border-zinc-300 bg-white px-4 pr-20 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center gap-1 px-4 text-sm font-medium text-brand" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}{showPassword ? "Hide" : "Show"}</button>
          </div>

          {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}

          <button disabled={isLoading} className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-brand font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-[#55205f] disabled:cursor-not-allowed disabled:opacity-65">
            <LogIn size={18} aria-hidden="true" />{isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
