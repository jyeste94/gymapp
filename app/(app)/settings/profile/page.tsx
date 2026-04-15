"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, Check, X, Ruler, LineChart, Settings, Edit2 } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";
import { ensureUserProfile, updateUserProfile, checkUsernameAvailability } from "@/lib/firestore/user";
import type { UserProfile } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

// Schema de validación
const profileSchema = z.object({
    displayName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
    username: z.string()
        .min(3, "Mínimo 3 caracteres")
        .max(20, "Máximo 20 caracteres")
        .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos")
        .optional()
        .or(z.literal("")),
    bio: z.string().max(160, "La biografía no puede superar los 160 caracteres").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user } = useAuth();
    const { db } = useFirebase();

    const [loadingConfig, setLoadingConfig] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    // Form setup
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    // Watch username for real-time validation
    const watchedUsername = watch("username");

    // Initial Data Load
    useEffect(() => {
        if (!user || !db) return;

        const loadProfile = async () => {
            try {
                // Aseguramos que existe el perfil, si no lo crea
                const profile = await ensureUserProfile(db, user);
                setProfileData(profile);

                setValue("displayName", profile.displayName || user.displayName || "");
                setValue("username", profile.username || "");
                setValue("bio", profile.bio || "");
            } catch (error) {
                console.error("Error loading profile:", error);
                toast.error("Error al cargar el perfil");
            } finally {
                setLoadingConfig(false);
            }
        };

        loadProfile();
    }, [user, db, setValue]);

    // Username Availability Debounce Check
    useEffect(() => {
        if (!isEditing || !db || !watchedUsername || watchedUsername.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        const check = async () => {
            setCheckingUsername(true);
            try {
                const isAvailable = await checkUsernameAvailability(db, watchedUsername, user?.uid);
                setUsernameAvailable(isAvailable);
            } catch (error) {
                console.error(error);
            } finally {
                setCheckingUsername(false);
            }
        };

        const timeout = setTimeout(check, 500);
        return () => clearTimeout(timeout);
    }, [watchedUsername, db, user, isEditing]);

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user || !db) return;

        if (data.username && usernameAvailable === false) {
            toast.error("El nombre de usuario no está disponible");
            return;
        }

        try {
            await updateUserProfile(db, user.uid, {
                displayName: data.displayName,
                username: data.username || null,
                bio: data.bio || null,
            });

            setProfileData((prev: UserProfile | null) => prev ? ({
                ...prev,
                displayName: data.displayName,
                username: data.username || null,
                bio: data.bio || null,
            }) : null);

            toast.success("Perfil actualizado");
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar");
        }
    };

    if (loadingConfig || !user) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;
    }

    // --- VIEW MODE (DASHBOARD) ---
    if (!isEditing) {
        return (
            <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
                <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
                    {/* Header / Profile Card */}
                    <div className="rounded-3xl border border-brand-border bg-brand-surface px-6 pb-6 pt-8 shadow-sm">
                        <div className="mb-6 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[rgba(30,30,30,0.5)]">
                                    {user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.displayName || "User"}
                                            width={80}
                                            height={80}
                                            className="h-full w-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-brand-dark text-lg font-bold text-brand-text-muted">
                                            {(user.displayName?.[0] || user.email?.[0] || "?").toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-brand-text-main">{profileData?.displayName || "Atleta"}</h1>
                                    <p className="text-sm text-brand-text-muted">@{profileData?.username || "usuario"}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="rounded-full bg-brand-dark p-2 text-brand-primary hover:bg-brand-dark/80"
                            >
                                <Edit2 className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Bio */}
                        {profileData?.bio && (
                            <p className="mb-6 text-sm text-brand-text-muted">{profileData.bio}</p>
                        )}

                        {/* Mini Stats (Weight/Height) - Could be dynamic later */}
                        <div className="flex divide-x divide-brand-border rounded-2xl border border-brand-border bg-brand-dark py-3">
                            <div className="flex-1 text-center">
                                <p className="text-xs font-bold text-brand-text-muted uppercase">Peso</p>
                                <p className="font-semibold text-brand-text-main">{profileData?.weightKg || "--"} kg</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-xs font-bold text-brand-text-muted uppercase">Altura</p>
                                <p className="font-semibold text-brand-text-main">{profileData?.heightCm || "--"} cm</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-xs font-bold text-brand-text-muted uppercase">Grasa</p>
                                <p className="font-semibold text-brand-text-main">{profileData?.bodyFatPct || "--"} %</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="p-4 space-y-4">
                        <h2 className="px-2 text-sm font-bold text-brand-text-main">Accesos Directos</h2>

                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/measurements" className="group relative overflow-hidden rounded-2xl bg-brand-surface p-4 shadow-sm border border-brand-border transition hover:shadow-md hover:border-brand-primary/50">
                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                                    <Ruler className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-brand-text-main">Mediciones</h3>
                                <p className="text-xs text-brand-text-muted">Registra y analiza tu cuerpo</p>
                            </Link>

                            <Link href="/progress" className="group relative overflow-hidden rounded-2xl bg-brand-surface p-4 shadow-sm border border-brand-border transition hover:shadow-md hover:border-brand-primary/50">
                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                                    <LineChart className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-brand-text-main">Progreso</h3>
                                <p className="text-xs text-brand-text-muted">Gráficas de fuerza y volumen</p>
                            </Link>

                            <Link href="/settings" className="group relative overflow-hidden rounded-2xl bg-brand-surface p-4 shadow-sm border border-brand-border transition hover:shadow-md hover:border-brand-primary/50">
                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark text-brand-text-muted">
                                    <Settings className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-brand-text-main">Ajustes</h3>
                                <p className="text-xs text-brand-text-muted">Configuración de cuenta</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- EDIT MODE ---
    return (
        <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
            <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
                <header className="sticky top-0 z-20 -mx-4 -mt-6 flex items-center gap-3 border-b border-brand-border bg-brand-surface/95 px-6 py-4 backdrop-blur-sm sm:mx-0 sm:mt-0 sm:rounded-t-3xl">
                    <button onClick={() => setIsEditing(false)} className="text-brand-text-muted hover:text-brand-text-main">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-base font-bold text-brand-text-main">Editar Perfil</h1>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-2">
                    {/* Same Form Content As Before */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[rgba(30,30,30,0.5)]">
                            {user.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt={user.displayName || "User"}
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-brand-dark text-lg font-bold text-brand-text-muted">
                                    {(user.displayName?.[0] || user.email?.[0] || "?").toUpperCase()}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-brand-text-muted">La foto se sincroniza con tu cuenta de Google</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Nombre</label>
                            <input
                                {...register("displayName")}
                                className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-text-main outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                                placeholder="Tu nombre completo"
                            />
                            {errors.displayName && <p className="text-xs text-red-400">{errors.displayName.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
                                Nombre de usuario
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-brand-text-muted">@</span>
                                <input
                                    {...register("username")}
                                    className={clsx(
                                        "w-full rounded-xl border bg-brand-surface pl-8 pr-10 py-3 text-sm text-brand-text-main outline-none focus:ring-1",
                                        usernameAvailable === false
                                            ? "border-red-400/50 focus:border-red-400 focus:ring-red-400"
                                            : "border-brand-border focus:border-brand-primary focus:ring-brand-primary"
                                    )}
                                    placeholder="usuario123"
                                    autoCapitalize="none"
                                />

                                <div className="absolute right-3 top-3">
                                    {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-brand-text-muted" />}
                                    {!checkingUsername && watchedUsername && watchedUsername.length >= 3 && (
                                        usernameAvailable ?
                                            <Check className="h-4 w-4 text-emerald-400" /> :
                                            <X className="h-4 w-4 text-red-400" />
                                    )}
                                </div>
                            </div>
                            {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
                            {usernameAvailable === false && <p className="text-xs text-red-400">Este usuario ya está ocupado</p>}
                            <p className="text-xs text-brand-text-muted/60">Único en toda la app. Te servirá para que te encuentren.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Biografía</label>
                            <textarea
                                {...register("bio")}
                                rows={3}
                                className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-text-main outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                                placeholder="Cuéntanos un poco sobre ti..."
                            />
                            {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
                        </div>
                    </div>

                    <button
                        disabled={isSubmitting || (usernameAvailable === false)}
                        className="w-full rounded-xl bg-brand-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? "Guardando..." : "Guardar cambios"}
                    </button>
                </form>
            </div>
        </div>
    );
}
