"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FirebaseError } from "firebase/app";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";
import { loginEmail, signupEmail, loginGoogle } from "@/lib/firebase/auth-actions";

type ProviderId = "google";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-apple-near-black/60">Cargando...</div>}>
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

  const providers: { id: ProviderId; label: string }[] = [{ id: "google", label: "Continuar con Google" }];

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
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Correo o contrasena incorrectos.";
      case "auth/popup-closed-by-user":
        return "Has cerrado la ventana antes de terminar.";
      case "auth/account-exists-with-different-credential":
        return "Ya existe una cuenta con este correo. Usa Google.";
      case "auth/email-already-in-use":
        return "Este correo ya esta registrado. Prueba a iniciar sesion.";
      case "auth/weak-password":
        return "La contrasena es muy debil (minimo 6 caracteres).";
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Espera unos minutos.";
      default:
        console.error("Auth Error:", fbError.code);
        return "No se pudo iniciar sesion. Verifica tus datos.";
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

  if (!app || authLoading) {
    return <div className="grid min-h-dvh place-items-center text-sm text-apple-near-black/60">Cargando...</div>;
  }

  return (
    <main className="min-h-dvh bg-apple-black px-5 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-3xl border border-white/12 bg-apple-black p-10 text-white shadow-apple-card lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="apple-kicker text-white/50">Athlos Fit</p>
            <h1 className="mt-5 sf-display-hero max-w-[14ch] text-white">Entrena con foco. Registra con precision.</h1>
            <p className="mt-6 sf-text-body max-w-[42ch] text-white/74">
              Tu panel central para rutinas, nutricion y progreso con una interfaz limpia inspirada en Apple.
            </p>
          </div>
          <p className="sf-text-caption text-white/48">Sin ruido visual. Solo datos utiles para mejorar cada semana.</p>
        </section>

        <section className="apple-panel w-full p-8 sm:p-10">
          <div className="space-y-1">
            <p className="apple-kicker">Athlos Fit</p>
            <h2 className="sf-display-section text-apple-near-black">{isSignup ? "Crea tu cuenta" : "Inicia sesion"}</h2>
            <p className="sf-text-body text-apple-near-black/64">
              {isSignup
                ? "Registrate con correo o con tu proveedor principal."
                : "Accede a tus rutinas, mediciones y progreso desde un unico lugar."}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="sf-text-micro text-apple-near-black/56">Correo</label>
              <input
                className="w-full"
                placeholder="tu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={isBusy}
              />
            </div>
            <div className="space-y-2">
              <label className="sf-text-micro text-apple-near-black/56">Contrasena</label>
              <input
                className="w-full"
                type="password"
                placeholder={isSignup ? "Minimo 6 caracteres" : "Introduce tu contrasena"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
                disabled={isBusy}
              />
            </div>

            <button onClick={handleEmailSubmit} className="btn-apple-primary w-full disabled:opacity-60" type="button" disabled={isBusy}>
              {emailLoading ? (isSignup ? "Creando..." : "Accediendo...") : isSignup ? "Crear cuenta" : "Entrar"}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 sf-text-micro text-apple-near-black/44">
            <span className="h-px flex-1 bg-apple-near-black/12" aria-hidden />
            <span>{isSignup ? "o registrate con" : "o continua con"}</span>
            <span className="h-px flex-1 bg-apple-near-black/12" aria-hidden />
          </div>

          <div className="mt-4 space-y-3">
            {providers.map((provider) => (
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

          {errorMessage && <p className="mt-4 sf-text-caption text-[#ff3b30]">{errorMessage}</p>}

          <div className="mt-6 text-center sf-text-caption text-apple-near-black/62">
            {isSignup ? "Ya tienes cuenta?" : "Aun no tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isSignup ? "login" : "signup");
                setErrorMessage(null);
              }}
              className="font-semibold text-apple-link-blue transition hover:opacity-80"
              disabled={isBusy}
            >
              {isSignup ? "Inicia sesion" : "Registrate"}
            </button>
          </div>
        </section>
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
          classes:
            "border border-apple-near-black/14 bg-white text-apple-near-black hover:border-apple-near-black/24 dark:border-white/14 dark:bg-apple-surface-1 dark:text-white",
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
      className={`flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 sf-text-body-strong transition disabled:opacity-60 ${classes}`}
    >
      <span className="flex h-5 w-5 items-center justify-center" aria-hidden>
        {icon}
      </span>
      <span>{loading ? "Conectando..." : children}</span>
    </button>
  );
}

const GoogleIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);