"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import EditProfileDialog from "@/components/profile/edit-profile-dialog";
import { useUserProfile } from "@/lib/hooks/user-profile-hooks";

export default function ProfileHeader() {
  const { profile, loading } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  const bmi = (() => {
    if (!profile?.weightKg || !profile?.heightCm) return null;
    const heightM = profile.heightCm / 100;
    return (profile.weightKg / (heightM * heightM)).toFixed(1);
  })();

  if (loading) {
    return <div className="h-32 w-full animate-pulse rounded-3xl bg-white/70 dark:bg-apple-surface-2/80" />;
  }

  const displayName = profile?.displayName || "Atleta";

  return (
    <>
      <section className="apple-panel p-6 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-apple-gray text-lg font-semibold text-apple-near-black dark:bg-apple-surface-2 dark:text-white">
              {profile?.photoURL ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.photoURL}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                displayName[0]?.toUpperCase() || "A"
              )}
            </div>
            <div className="space-y-1">
              <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">Perfil</p>
              <h2 className="sf-text-subheading text-apple-near-black dark:text-white">{displayName}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn-apple-ghost inline-flex items-center gap-2 self-start md:self-auto"
          >
            <Pencil className="h-4 w-4" /> Editar
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MetricCard label="Peso" value={profile?.weightKg ? `${profile.weightKg} kg` : "--"} />
          <MetricCard label="Altura" value={profile?.heightCm ? `${profile.heightCm} cm` : "--"} />
          <MetricCard label="IMC" value={bmi ?? "--"} />
        </div>
      </section>

      <EditProfileDialog isOpen={isEditing} onClose={() => setIsEditing(false)} />
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="apple-panel-muted p-4 text-center">
      <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">{label}</p>
      <p className="mt-1 sf-text-body-emphasis text-apple-near-black dark:text-white">{value}</p>
    </div>
  );
}
