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
              "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition duration-200 border border-transparent",
              isActive
                ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-sm shadow-brand-primary/5"
                : "text-brand-text-muted hover:bg-brand-dark hover:border-brand-border hover:text-brand-text-main hover:shadow-sm"
            )}
          >
            <span
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-xl border text-[0.85rem] transition duration-200",
                isActive
                  ? "border-brand-primary/30 bg-brand-primary/20 text-brand-primary"
                  : "border-brand-border bg-brand-dark/50 text-brand-text-muted group-hover:bg-brand-surface group-hover:text-brand-text-main group-hover:border-brand-border/80"
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
