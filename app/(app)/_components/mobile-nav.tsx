"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { ComponentType } from "react";
import { navItems } from "@/app/(app)/_components/nav-items";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border bg-brand-surface/90 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:hidden">
      <ul className="flex items-center justify-around px-2 py-3 pb-6">
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
        "relative flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-brand-primary" : "text-brand-text-muted hover:text-brand-text-main"
      )}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <span className="absolute -top-2 h-1 w-1 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
      )}
      <Icon className={clsx("h-6 w-6 transition-transform", active && "scale-110")} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
