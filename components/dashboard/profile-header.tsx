"use client";
import { useState } from "react";
import { useUserProfile } from "@/lib/hooks/user-profile-hooks";
import EditProfileDialog from "@/components/profile/edit-profile-dialog";

export default function ProfileHeader() {
    const { profile, loading } = useUserProfile();
    const [isEditing, setIsEditing] = useState(false);

    const getBMI = () => {
        if (!profile?.weightKg || !profile?.heightCm) return null;
        const heightM = profile.heightCm / 100;
        return (profile.weightKg / (heightM * heightM)).toFixed(1);
    };

    if (loading) return <div className="h-32 w-full animate-pulse rounded-3xl bg-white/50" />;

    return (
        <>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0a2e5c] to-[#1a4b8c] p-6 text-white shadow-xl shadow-blue-900/20 md:p-8">
                {/* Decorative Circles */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-8 right-20 h-32 w-32 rounded-full bg-blue-400/20 blur-2xl" />

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur-md overflow-hidden">
                            {profile?.photoURL ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={profile.photoURL}
                                    alt={profile.displayName || "User"}
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                profile?.displayName?.[0]?.toUpperCase() ?? "U"
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-200">Bienvenido de vuelta,</p>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {profile?.displayName || "Atleta"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex flex-col items-center rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                            <span className="text-xs text-blue-200">Peso</span>
                            <span className="text-lg font-bold">{profile?.weightKg ?? "--"} <span className="text-xs font-normal opacity-70">kg</span></span>
                        </div>
                        <div className="flex flex-col items-center rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                            <span className="text-xs text-blue-200">Altura</span>
                            <span className="text-lg font-bold">{profile?.heightCm ?? "--"} <span className="text-xs font-normal opacity-70">cm</span></span>
                        </div>
                        <div className="flex flex-col items-center rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                            <span className="text-xs text-blue-200">IMC</span>
                            <span className="text-lg font-bold">{getBMI() ?? "--"}</span>
                        </div>

                        <button
                            onClick={() => setIsEditing(true)}
                            className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                        >
                            ✎
                        </button>
                    </div>
                </div>
            </div>

            <EditProfileDialog isOpen={isEditing} onClose={() => setIsEditing(false)} />
        </>
    );
}
