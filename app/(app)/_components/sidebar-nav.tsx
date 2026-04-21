"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navItems } from "@/app/(app)/_components/nav-items";

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-2 space-y-1.5 px-1">
      <p className="apple-kicker px-4 pb-1 text-white/48">Menu</p>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "group relative flex items-center gap-4 rounded-xl px-4 py-3 sf-text-body transition-colors duration-200 outline-none",
              isActive
                ? "bg-white/12 font-medium text-apple-link-dark"
                : "font-normal text-white/72 hover:bg-white/8 hover:text-white"
            )}
          >
            <Icon className={clsx("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2.05px]")} />
            <span className="tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
