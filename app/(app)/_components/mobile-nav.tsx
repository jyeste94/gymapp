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
                  ? "border-transparent bg-gradient-to-r from-[rgba(34,99,255,0.16)] via-[rgba(255,174,0,0.16)] to-[rgba(255,25,16,0.16)] text-zinc-900 shadow"
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
