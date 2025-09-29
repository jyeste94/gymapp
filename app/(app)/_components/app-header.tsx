"use client";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { User } from "lucide-react";

export default function AppHeader() {
  const { user } = useAuth();

  const avatar = user?.photoURL ?? null;
  const displayName = user?.displayName ?? user?.email ?? "Invitado";
  const summaryText = `Hola ${displayName}, este es tu resumen personal de la semana.`;

  return (
    <header className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 px-4 py-4 sm:px-6">
      <Link
        href="/settings"
        className="flex items-center gap-3 rounded-full bg-white/80 px-3 py-2 text-sm text-[#0a2e5c] transition hover:-translate-y-0.5 hover:shadow"
      >
        <Avatar photoUrl={avatar} name={displayName} />
        <div className="flex flex-col text-left">
          <span className="font-semibold">{displayName}</span>
          <span className="text-xs text-[#51607c] line-clamp-2">{summaryText}</span>
        </div>
      </Link>
    </header>
  );
}

type AvatarProps = {
  photoUrl: string | null;
  name: string;
};

function Avatar({ photoUrl, name }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "AF";

  if (photoUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={photoUrl}
        alt={name}
        className="h-10 w-10 rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a2e5c]/10 text-sm font-semibold text-[#0a2e5c]">
      {initials.length === 0 ? <User className="h-5 w-5" /> : initials}
    </span>
  );
}
