"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navItems } from "@/app/(app)/_components/nav-items";

export default function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-6 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
              isActive
                ? "bg-[#e6edff] text-[#1c2d5a] shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-white/70"
            )}
          >
            <span
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-full border text-[0.85rem] transition",
                isActive
                  ? "border-[#2263ff]/40 bg-white text-[#1c2d5a] shadow"
                  : "border-[rgba(34,99,255,0.16)] bg-white/70 text-zinc-500 group-hover:border-[rgba(34,99,255,0.28)] group-hover:text-zinc-700"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
