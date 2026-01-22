"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FirebaseError } from "firebase/app";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";
import {
  loginEmail,
  signupEmail,
  loginGoogle,
} from "@/lib/firebase/auth-actions";

type ProviderId = "google";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh grid place-items-center text-sm text-[#51607c]">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { user, loading: authLoading } = useAuth();
  const { app } = useFirebase();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<ProviderId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const isSignup = mode === "signup";

  const providerActions: Record<ProviderId, () => Promise<unknown>> = {
    google: () => loginGoogle(app!),
  };

  const PROVIDERS: { id: ProviderId; label: string }[] = [
    { id: "google", label: "Continuar con Google" },
  ];

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirect);
    }
  }, [user, authLoading, router, redirect]);

  const isBusy = emailLoading || providerLoading !== null || !app;

  const parseFirebaseError = (error: unknown) => {
    const fbError = error as FirebaseError | undefined;
    if (!fbError?.code) {
      return (error as Error | undefined)?.message ?? "No se pudo completar la accion.";
    }
    switch (fbError.code) {
      case "auth/invalid-email":
        return "El correo no es valido.";
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Credenciales incorrectas.";
      case "auth/popup-closed-by-user":
        return "El popup se cerro antes de completar el acceso.";
      case "auth/account-exists-with-different-credential":
        return "Ya existe una cuenta con otras credenciales. Usa el proveedor asociado.";
      case "auth/email-already-in-use":
        return "Este correo ya esta registrado. Inicia sesion.";
      case "auth/weak-password":
        return "La contrasena debe tener al menos 6 caracteres.";
      default:
        return fbError?.message ?? "No se pudo completar la accion.";
    }
  };

  const handleEmailSubmit = async () => {
    if (!email || !password || !app) {
      setErrorMessage("Introduce correo y contrasena.");
      return;
    }
    try {
      setErrorMessage(null);
      setEmailLoading(true);
      if (isSignup) {
        await signupEmail(app, email, password);
      } else {
        await loginEmail(app, email, password);
      }
    } catch (error) {
      setErrorMessage(parseFirebaseError(error));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleProviderLogin = async (providerId: ProviderId) => {
    if (!app) return;
    try {
      setErrorMessage(null);
      setProviderLoading(providerId);
      await providerActions[providerId]();
    } catch (error) {
      setErrorMessage(parseFirebaseError(error));
    } finally {
      setProviderLoading(null);
    }
  };

  // Render a loading state if Firebase app is not initialized yet.
  if (!app || authLoading) {
    return <div className="min-h-dvh grid place-items-center text-sm text-[#51607c]">Cargando...</div>;
  }

  return (
    <main className="min-h-dvh grid place-items-center px-6 py-10">
      <div className="glass-card w-full max-w-lg border-[rgba(10,46,92,0.16)] bg-white/80 p-8">
        <div className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#0a2e5c]/55">Athlos Fit</p>
          <h1 className="text-3xl font-semibold text-[#0a2e5c]">
            {isSignup ? "Crea tu cuenta" : "Inicia sesion"}
          </h1>
          <p className="text-sm text-[#51607c]">
            {isSignup
              ? "Registrate con tu correo o con tu proveedor favorito."
              : "Gestiona tus rutinas, mediciones y progreso desde un solo lugar."}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-[#51607c]">Correo</label>
            <input
              className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isBusy}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#51607c]">Contrasena</label>
            <input
              className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm"
              type="password"
              placeholder={isSignup ? "Minimo 6 caracteres" : "Introduce tu contrasena"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              disabled={isBusy}
            />
          </div>
          <button
            onClick={handleEmailSubmit}
            className="primary-button w-full justify-center disabled:opacity-60"
            type="button"
            disabled={isBusy}
          >
            {emailLoading ? (isSignup ? "Creando..." : "Accediendo...") : isSignup ? "Crear cuenta" : "Entrar"}
          </button>
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-[#0a2e5c]/55">
          <span className="h-px flex-1 bg-zinc-200" aria-hidden />
          <span>{isSignup ? "o registrate con" : "o continua con"}</span>
          <span className="h-px flex-1 bg-zinc-200" aria-hidden />
        </div>

        <div className="mt-4 space-y-3">
          {PROVIDERS.map((provider) => (
            <ProviderButton
              key={provider.id}
              provider={provider.id}
              onClick={() => handleProviderLogin(provider.id)}
              disabled={isBusy}
              loading={providerLoading === provider.id}
            >
              {provider.label}
            </ProviderButton>
          ))}
        </div>

        {errorMessage && <p className="mt-4 text-sm text-red-500">{errorMessage}</p>}

        <div className="mt-6 text-center text-xs text-[#51607c]">
          {isSignup ? "Ya tienes cuenta?" : "Aun no tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "login" : "signup");
              setErrorMessage(null);
            }}
            className="font-semibold text-[#0a2e5c] transition hover:text-[#08254a]"
            disabled={isBusy}
          >
            {isSignup ? "Inicia sesion" : "Registrate"}
          </button>
        </div>
      </div>
    </main>
  );
}

type ProviderButtonProps = {
  provider: ProviderId;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: string;
};

function ProviderButton({ provider, onClick, disabled, loading, children }: ProviderButtonProps) {
  const { classes, icon } = useMemo(() => {
    switch (provider) {
      case "google":
        return {
          classes: "border border-[rgba(10,46,92,0.2)] bg-white text-[#0a2e5c] hover:border-[rgba(10,46,92,0.3)]",
          icon: GoogleIcon,
        };
      default:
        return { classes: "", icon: null };
    }
  }, [provider]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${classes}`}
    >
      <span className="flex h-6 w-6 items-center justify-center" aria-hidden>
        {icon}
      </span>
      <span>{loading ? "Conectando..." : children}</span>
    </button>
  );
}

const GoogleIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);
