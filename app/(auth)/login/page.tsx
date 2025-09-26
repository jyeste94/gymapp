"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FirebaseError } from "firebase/app";
import { useRouter, useSearchParams } from "next/navigation";
import {
  loginEmail,
  signupEmail,
  loginGoogle,
  loginFacebook,
  loginTwitter,
  loginApple,
  useAuth,
} from "@/lib/firebase/auth-hooks";

type ProviderId = "google" | "facebook" | "twitter" | "apple";
type ProviderButtonConfig = {
  id: ProviderId;
  label: string;
  action: () => Promise<unknown>;
};

const PROVIDERS: ProviderButtonConfig[] = [
  { id: "google", label: "Continuar con Google", action: loginGoogle },
  { id: "facebook", label: "Continuar con Facebook", action: loginFacebook },
  { id: "twitter", label: "Continuar con Twitter", action: loginTwitter },
  { id: "apple", label: "Continuar con Apple", action: loginApple },
];

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh grid place-items-center text-sm text-zinc-500">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { user, loading } = useAuth();
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

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect);
    }
  }, [user, loading, router, redirect]);

  const isBusy = emailLoading || providerLoading !== null;

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
        return fbError.message ?? "No se pudo completar la accion.";
    }
  };

  const handleEmailSubmit = async () => {
    if (!email || !password) {
      setErrorMessage("Introduce correo y contrasena.");
      return;
    }
    try {
      setErrorMessage(null);
      setEmailLoading(true);
      if (isSignup) {
        await signupEmail(email, password);
      } else {
        await loginEmail(email, password);
      }
    } catch (error) {
      setErrorMessage(parseFirebaseError(error));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleProviderLogin = async (provider: ProviderButtonConfig) => {
    try {
      setErrorMessage(null);
      setProviderLoading(provider.id);
      await provider.action();
    } catch (error) {
      setErrorMessage(parseFirebaseError(error));
    } finally {
      setProviderLoading(null);
    }
  };

  return (
    <main className="min-h-dvh grid place-items-center px-6 py-10">
      <div className="glass-card w-full max-w-lg border-[rgba(34,99,255,0.16)] bg-white/80 p-8">
        <div className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Gym Flow</p>
          <h1 className="text-3xl font-semibold text-zinc-900">
            {isSignup ? "Crea tu cuenta" : "Inicia sesion"}
          </h1>
          <p className="text-sm text-zinc-500">
            {isSignup
              ? "Registrate con tu correo o con tu proveedor favorito."
              : "Gestiona tus rutinas, mediciones y progreso desde un solo lugar."}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Correo</label>
            <input
              className="w-full rounded-2xl border border-[rgba(34,99,255,0.26)] bg-white/90 px-3 py-2 text-sm"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isBusy}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Contrasena</label>
            <input
              className="w-full rounded-2xl border border-[rgba(34,99,255,0.26)] bg-white/90 px-3 py-2 text-sm"
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

        <div className="mt-6 flex items-center gap-4 text-xs text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200" aria-hidden />
          <span>{isSignup ? "o registrate con" : "o continua con"}</span>
          <span className="h-px flex-1 bg-zinc-200" aria-hidden />
        </div>

        <div className="mt-4 space-y-3">
          {PROVIDERS.map((provider) => (
            <ProviderButton
              key={provider.id}
              provider={provider.id}
              onClick={() => handleProviderLogin(provider)}
              disabled={isBusy}
              loading={providerLoading === provider.id}
            >
              {provider.label}
            </ProviderButton>
          ))}
        </div>

        {errorMessage && <p className="mt-4 text-sm text-red-500">{errorMessage}</p>}

        <div className="mt-6 text-center text-xs text-zinc-500">
          {isSignup ? "Ya tienes cuenta?" : "Aun no tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "login" : "signup");
              setErrorMessage(null);
            }}
            className="font-semibold text-[#2263ff] transition hover:text-[#1a4de0]"
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
          classes: "border border-[rgba(34,99,255,0.2)] bg-white text-zinc-700 hover:border-[rgba(34,99,255,0.3)]",
          icon: GoogleIcon,
        };
      case "facebook":
        return {
          classes: "bg-[#1877f2] text-white hover:bg-[#1664c7]",
          icon: FacebookIcon,
        };
      case "twitter":
        return {
          classes: "bg-black text-white hover:bg-zinc-800",
          icon: TwitterIcon,
        };
      case "apple":
        return {
          classes: "bg-zinc-900 text-white hover:bg-black",
          icon: AppleIcon,
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

const FacebookIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
    <g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none"><g transform="scale(5.12,5.12)"><path d="M25,3c-12.15,0 -22,9.85 -22,22c0,11.03 8.125,20.137 18.712,21.728v-15.897h-5.443v-5.783h5.443v-3.848c0,-6.371 3.104,-9.168 8.399,-9.168c2.536,0 3.877,0.188 4.512,0.274v5.048h-3.612c-2.248,0 -3.033,2.131 -3.033,4.533v3.161h6.588l-0.894,5.783h-5.694v15.944c10.738,-1.457 19.022,-10.638 19.022,-21.775c0,-12.15 -9.85,-22 -22,-22z"></path></g></g>
</svg>
);

const TwitterIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
    <g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" ><g transform="scale(8.53333,8.53333)"><path d="M26.37,26l-8.795,-12.822l0.015,0.012l7.93,-9.19h-2.65l-6.46,7.48l-5.13,-7.48h-6.95l8.211,11.971l-0.001,-0.001l-8.66,10.03h2.65l7.182,-8.322l5.708,8.322zM10.23,6l12.34,18h-2.1l-12.35,-18z"></path></g></g>
  </svg>    
);

const AppleIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
<g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none"><g transform="scale(5.12,5.12)"><path d="M44.52734,34.75c-1.07812,2.39453 -1.59766,3.46484 -2.98437,5.57813c-1.94141,2.95313 -4.67969,6.64063 -8.0625,6.66406c-3.01172,0.02734 -3.78906,-1.96484 -7.87891,-1.92969c-4.08594,0.01953 -4.9375,1.96875 -7.95312,1.9375c-3.38672,-0.03125 -5.97656,-3.35156 -7.91797,-6.30078c-5.42969,-8.26953 -6.00391,-17.96484 -2.64844,-23.12109c2.375,-3.65625 6.12891,-5.80469 9.65625,-5.80469c3.59375,0 5.85156,1.97266 8.82031,1.97266c2.88281,0 4.63672,-1.97656 8.79297,-1.97656c3.14063,0 6.46094,1.71094 8.83594,4.66406c-7.76562,4.25781 -6.50391,15.34766 1.33984,18.31641zM31.19531,8.46875c1.51172,-1.94141 2.66016,-4.67969 2.24219,-7.46875c-2.46484,0.16797 -5.34766,1.74219 -7.03125,3.78125c-1.52734,1.85938 -2.79297,4.61719 -2.30078,7.28516c2.69141,0.08594 5.47656,-1.51953 7.08984,-3.59766z"></path></g></g>
</svg>  
);
