"use client";
import { useState } from "react";
import { useUserProfile } from "@/lib/hooks/user-profile-hooks";
import { useAuth } from "@/lib/firebase/auth-hooks";

type EditProfileDialogProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function EditProfileDialog({ isOpen, onClose }: EditProfileDialogProps) {
    const { user } = useAuth();
    const { profile, updateProfile } = useUserProfile();

    const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || "");
    const [heightCm, setHeightCm] = useState(profile?.heightCm?.toString() || "");
    const [weightKg, setWeightKg] = useState(profile?.weightKg?.toString() || "");
    const [bodyFatPct, setBodyFatPct] = useState(profile?.bodyFatPct?.toString() || "");
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile({
                displayName,
                heightCm: heightCm ? parseFloat(heightCm) : null,
                weightKg: weightKg ? parseFloat(weightKg) : null,
                bodyFatPct: bodyFatPct ? parseFloat(bodyFatPct) : null,
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al actualizar perfil");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#0a2e5c]">Editar Perfil</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre visible</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Ej: Juan Perez"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Altura (cm)</label>
                            <input
                                type="number"
                                value={heightCm}
                                onChange={(e) => setHeightCm(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="175"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Peso (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={weightKg}
                                onChange={(e) => setWeightKg(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="75.5"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">% Grasa Corporal (Aprox)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={bodyFatPct}
                            onChange={(e) => setBodyFatPct(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="15"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-[#0a2e5c] hover:bg-[#0a2e5c]/90 transition-colors shadow-lg shadow-blue-900/20"
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
