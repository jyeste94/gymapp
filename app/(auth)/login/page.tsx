"use client";
import { loginEmail, loginGoogle, useAuth } from "@/lib/firebase/auth-hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [email,setEmail] = useState(""); const [pass,setPass] = useState("");
  const router = useRouter(); const sp = useSearchParams();
  const redirect = sp.get("redirect") ?? "/";

  useEffect(() => { if (!loading && user) router.replace(redirect); }, [user, loading, router, redirect]);

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Inicia sesión</h1>
        <div className="space-y-2">
          <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" type="password" placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} />
          <button onClick={() => loginEmail(email, pass)} className="w-full rounded-lg border px-3 py-2">Entrar</button>
        </div>
        <div className="pt-2">
          <button onClick={() => loginGoogle()} className="w-full rounded-lg border px-3 py-2">Continuar con Google</button>
        </div>
      </div>
    </main>
  );
}
