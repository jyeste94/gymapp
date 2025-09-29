"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { ComponentType } from "react";
import { navItems } from "@/app/(app)/_components/nav-items";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(10,46,92,0.12)] bg-white/95 shadow-[0_-8px_24px_-18px_rgba(10,46,92,0.4)] backdrop-blur-md lg:hidden">
      <ul className="flex items-center justify-between gap-1 px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <LinkButton icon={Icon} label={item.label} href={item.href} active={isActive} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type LinkButtonProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active: boolean;
};

function LinkButton({ icon: Icon, label, href, active }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition",
        active
          ? "bg-[#0a2e5c]/10 text-[#0a2e5c]"
          : "text-[#51607c] hover:bg-[#0a2e5c]/5"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={clsx("h-5 w-5", active ? "text-[#0a2e5c]" : "text-[#51607c]")} />
      {label}
    </Link>
  );
}
