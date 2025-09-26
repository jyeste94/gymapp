"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navItems } from "@/app/(app)/_components/nav-items";

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="lg:hidden">
      <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition",
                isActive
                  ? "border-[#2263ff]/30 bg-[#e6edff] text-[#1c2d5a] shadow"
                  : "border-[rgba(34,99,255,0.16)] bg-white/80 text-zinc-500"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
