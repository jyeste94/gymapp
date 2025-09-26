"use client";
import { loginEmail, loginGoogle, useAuth } from "@/lib/firebase/auth-hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh grid place-items-center text-sm text-zinc-500">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect);
    }
  }, [user, loading, router, redirect]);

  return (
    <main className="min-h-dvh grid place-items-center px-6 py-10">
      <div className="glass-card w-full max-w-lg border-[rgba(34,99,255,0.16)] bg-white/80 p-8">
        <div className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Gym Flow</p>
          <h1 className="text-3xl font-semibold text-zinc-900">Inicia sesion</h1>
          <p className="text-sm text-zinc-500">Gestiona tus rutinas, mediciones y progreso desde un solo lugar.</p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Email</label>
            <input
              className="w-full rounded-2xl border border-[rgba(34,99,255,0.26)] bg-white/90 px-3 py-2 text-sm"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Contraseña</label>
            <input
              className="w-full rounded-2xl border border-[rgba(34,99,255,0.26)] bg-white/90 px-3 py-2 text-sm"
              type="password"
              placeholder="Introduce tu contraseña"
              value={pass}
              onChange={(event) => setPass(event.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            onClick={() => loginEmail(email, pass)}
            className="primary-button w-full justify-center"
            type="button"
          >
            Entrar
          </button>
          <button
            onClick={() => loginGoogle()}
            className="secondary-button w-full justify-center"
            type="button"
          >
            Continuar con Google
          </button>
        </div>
      </div>
    </main>
  );
}
