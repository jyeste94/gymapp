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
                ? "bg-[#dbe6f6] text-[#0a2e5c] shadow-sm"
                : "text-[#51607c] hover:text-[#0a2e5c] hover:bg-white/70"
            )}
          >
            <span
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-full border text-[0.85rem] transition",
                isActive
                  ? "border-[#0a2e5c]/35 bg-white text-[#0a2e5c] shadow"
                  : "border-[rgba(10,46,92,0.16)] bg-white/70 text-[#51607c] group-hover:border-[rgba(10,46,92,0.26)] group-hover:text-[#0a2e5c]"
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
