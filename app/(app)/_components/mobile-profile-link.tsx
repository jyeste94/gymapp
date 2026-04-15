"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";

export default function MobileProfileLink() {
  const { user } = useAuth();
  const photoUrl = user?.photoURL ?? null;
  const name = user?.displayName ?? user?.email ?? "Perfil";

  return (
    <Link
      href="/settings/profile"
      aria-label="Abrir ajustes de perfil"
      className="fixed left-4 top-4 z-[70] flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-brand-border bg-brand-surface shadow-lg backdrop-blur lg:hidden"
      title={name}
    >
      {photoUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <User className="h-5 w-5 text-brand-text-muted" />
      )}
    </Link>
  );
}
