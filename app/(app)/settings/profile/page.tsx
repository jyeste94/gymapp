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
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-apple-near-black/35 dark:text-white/35" /></div>;
    }

    // --- VIEW MODE (DASHBOARD) ---
    if (!isEditing) {
        return (
            <div className="pb-32 pt-6 lg:pb-12 max-w-3xl mx-auto w-full space-y-8 px-5 lg:px-0">
                <header className="flex items-center justify-between">
                    <h1 className="sf-display-section text-apple-near-black dark:text-white">Perfil</h1>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-full bg-apple-gray dark:bg-apple-surface-2 p-2 text-apple-blue hover:opacity-80 transition-opacity"
                    >
                        <Edit2 className="h-5 w-5" />
                    </button>
                </header>

                {/* Profile Card */}
                <div className="rounded-3xl bg-white dark:bg-apple-surface-1 shadow-apple-card overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center gap-5 mb-4">
                            <div className="h-20 w-20 overflow-hidden rounded-full border border-apple-near-black/10 dark:border-white/10">
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
                                    <div className="flex h-full w-full items-center justify-center bg-apple-gray dark:bg-apple-surface-2 text-lg font-bold text-apple-near-black/50 dark:text-white/50">
                                        {(user.displayName?.[0] || user.email?.[0] || "?").toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="sf-display-card-title text-apple-near-black dark:text-white">{profileData?.displayName || "Atleta"}</h2>
                                <p className="sf-text-body text-apple-near-black/60 dark:text-white/60">@{profileData?.username || "usuario"}</p>
                            </div>
                        </div>

                        {/* Bio */}
                        {profileData?.bio && (
                            <p className="sf-text-body text-apple-near-black/80 dark:text-white/80 py-3">{profileData.bio}</p>
                        )}
                    </div>

                    {/* Mini Stats (Weight/Height) */}
                    <div className="flex divide-x divide-apple-near-black/10 dark:divide-white/10 border-t border-apple-near-black/10 dark:border-white/10 bg-apple-gray dark:bg-apple-surface-2 py-4">
                        <div className="flex-1 text-center">
                            <p className="sf-text-micro font-medium text-apple-near-black/50 dark:text-white/50 uppercase tracking-widest mb-1">Peso</p>
                            <p className="sf-text-body-strong text-apple-near-black dark:text-white">{profileData?.weightKg || "--"} kg</p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="sf-text-micro font-medium text-apple-near-black/50 dark:text-white/50 uppercase tracking-widest mb-1">Altura</p>
                            <p className="sf-text-body-strong text-apple-near-black dark:text-white">{profileData?.heightCm || "--"} cm</p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="sf-text-micro font-medium text-apple-near-black/50 dark:text-white/50 uppercase tracking-widest mb-1">Grasa</p>
                            <p className="sf-text-body-strong text-apple-near-black dark:text-white">{profileData?.bodyFatPct || "--"} %</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="space-y-4">
                    <h2 className="sf-text-body-strong text-apple-near-black dark:text-white px-2">Accesos Directos</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/measurements" className="group flex flex-col items-start rounded-2xl bg-white dark:bg-apple-surface-1 p-5 shadow-apple-card transition-colors hover:bg-apple-gray dark:hover:bg-apple-surface-2">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-apple-blue/10 text-apple-blue">
                                <Ruler className="h-5 w-5" />
                            </div>
                            <h3 className="sf-text-body-strong text-apple-near-black dark:text-white mb-1">Mediciones</h3>
                            <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">Registra y analiza tu cuerpo</p>
                        </Link>

                        <Link href="/progress" className="group flex flex-col items-start rounded-2xl bg-white dark:bg-apple-surface-1 p-5 shadow-apple-card transition-colors hover:bg-apple-gray dark:hover:bg-apple-surface-2">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-apple-blue/10 text-apple-blue">
                                <LineChart className="h-5 w-5" />
                            </div>
                            <h3 className="sf-text-body-strong text-apple-near-black dark:text-white mb-1">Progreso</h3>
                            <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">Gráficas de fuerza y volumen</p>
                        </Link>

                        <Link href="/settings" className="group flex flex-col items-start rounded-2xl bg-white dark:bg-apple-surface-1 p-5 shadow-apple-card transition-colors hover:bg-apple-gray dark:hover:bg-apple-surface-2">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-apple-blue/10 text-apple-blue">
                                <Settings className="h-5 w-5" />
                            </div>
                            <h3 className="sf-text-body-strong text-apple-near-black dark:text-white mb-1">Ajustes</h3>
                            <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">Configuración de cuenta</p>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // --- EDIT MODE ---
    return (
        <div className="pb-32 pt-6 lg:pb-12 max-w-3xl mx-auto w-full space-y-8 px-5 lg:px-0">
            <header className="flex items-center gap-3">
                <button onClick={() => setIsEditing(false)} className="text-apple-blue hover:opacity-80 transition-opacity">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="sf-display-section text-apple-near-black dark:text-white">Editar Perfil</h1>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-24 w-24 overflow-hidden rounded-full border border-apple-near-black/10 dark:border-white/10 shadow-apple-card">
                        {user.photoURL ? (
                            <Image
                                src={user.photoURL}
                                alt={user.displayName || "User"}
                                width={96}
                                height={96}
                                className="h-full w-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-apple-gray dark:bg-apple-surface-2 text-2xl font-bold text-apple-near-black/50 dark:text-white/50">
                                {(user.displayName?.[0] || user.email?.[0] || "?").toUpperCase()}
                            </div>
                        )}
                    </div>
                    <p className="sf-text-caption text-apple-near-black/50 dark:text-white/50 text-center max-w-xs">
                        La foto se sincroniza automáticamente con tu cuenta vinculada de Google.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="sf-text-caption-strong uppercase tracking-wider text-apple-near-black/50 dark:text-white/50 pl-1">Nombre</label>
                        <input
                            {...register("displayName")}
                            className="w-full bg-apple-gray dark:bg-apple-surface-1"
                            placeholder="Tu nombre completo"
                        />
                        {errors.displayName && <p className="sf-text-caption text-[#ff3b30] pl-1">{errors.displayName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="sf-text-caption-strong uppercase tracking-wider text-apple-near-black/50 dark:text-white/50 pl-1">
                            Nombre de usuario
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-[15px] sf-text-body text-apple-near-black/50 dark:text-white/50">@</span>
                            <input
                                {...register("username")}
                                className={clsx(
                                    "w-full pl-9 pr-10 bg-apple-gray dark:bg-apple-surface-1",
                                    usernameAvailable === false && "focus:outline-[#ff3b30] text-[#ff3b30]"
                                )}
                                placeholder="usuario123"
                                autoCapitalize="none"
                            />

                            <div className="absolute right-4 top-[15px]">
                                {checkingUsername && <Loader2 className="h-5 w-5 animate-spin text-apple-near-black/40 dark:text-white/40" />}
                                {!checkingUsername && watchedUsername && watchedUsername.length >= 3 && (
                                    usernameAvailable ?
                                        <Check className="h-5 w-5 text-[#34c759]" /> :
                                        <X className="h-5 w-5 text-[#ff3b30]" />
                                )}
                            </div>
                        </div>
                        {errors.username && <p className="sf-text-caption text-[#ff3b30] pl-1">{errors.username.message}</p>}
                        {usernameAvailable === false && <p className="sf-text-caption text-[#ff3b30] pl-1">Este usuario ya está ocupado</p>}
                        <p className="sf-text-caption text-apple-near-black/50 dark:text-white/50 pl-1">Único en toda la app. Te servirá para que te encuentren.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="sf-text-caption-strong uppercase tracking-wider text-apple-near-black/50 dark:text-white/50 pl-1">Biografía</label>
                        <textarea
                            {...register("bio")}
                            rows={4}
                            className="w-full resize-none bg-apple-gray dark:bg-apple-surface-1"
                            placeholder="Cuéntanos un poco sobre ti..."
                        />
                        {errors.bio && <p className="sf-text-caption text-[#ff3b30] pl-1">{errors.bio.message}</p>}
                    </div>
                </div>

                <div className="pt-4">
                  <button
                      disabled={isSubmitting || (usernameAvailable === false)}
                      className="btn-apple-primary w-full disabled:opacity-50"
                  >
                      {isSubmitting ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
            </form>
        </div>
    );
}
