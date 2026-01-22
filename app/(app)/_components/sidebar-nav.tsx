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
              "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition duration-200",
              isActive
                ? "bg-[#0a2e5c] text-white shadow-md shadow-[#0a2e5c]/20"
                : "text-[#51607c] hover:bg-white hover:text-[#0a2e5c] hover:shadow-sm"
            )}
          >
            <span
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-xl border text-[0.85rem] transition duration-200",
                isActive
                  ? "border-transparent bg-white/20 text-white"
                  : "border-[rgba(10,46,92,0.1)] bg-white/50 text-[#51607c] group-hover:border-[rgba(10,46,92,0.15)] group-hover:bg-white group-hover:text-[#0a2e5c]"
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
