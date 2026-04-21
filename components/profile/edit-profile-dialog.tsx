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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-apple-card dark:bg-apple-surface-1">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="sf-display-card-title text-apple-near-black dark:text-white">Editar perfil</h2>
          <button onClick={onClose} className="btn-apple-ghost h-9 w-9 rounded-full p-0" aria-label="Cerrar">
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block sf-text-caption text-apple-near-black/62 dark:text-white/62">Nombre visible</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full"
              placeholder="Ej: Juan Perez"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block sf-text-caption text-apple-near-black/62 dark:text-white/62">Altura (cm)</label>
              <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full" placeholder="175" />
            </div>
            <div>
              <label className="mb-1 block sf-text-caption text-apple-near-black/62 dark:text-white/62">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full"
                placeholder="75.5"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block sf-text-caption text-apple-near-black/62 dark:text-white/62">Grasa corporal (%)</label>
            <input
              type="number"
              step="0.1"
              value={bodyFatPct}
              onChange={(e) => setBodyFatPct(e.target.value)}
              className="w-full"
              placeholder="15"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-apple-ghost flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-apple-primary flex-1 disabled:opacity-60">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}