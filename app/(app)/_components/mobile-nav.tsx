"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { ComponentType } from "react";
import { navItems } from "@/app/(app)/_components/nav-items";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-white/10 bg-brand-surface/80 pb-safe backdrop-blur-2xl lg:hidden">
      <ul className="flex items-center justify-around px-2 py-3 pb-6 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="flex-1 relative">
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-x-2 -inset-y-1 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 shadow-[0_0_15px_rgba(62,224,127,0.05)] -z-10"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
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
        "relative flex flex-col items-center gap-1.5 transition-all duration-300 py-1",
        active ? "text-brand-primary" : "text-brand-text-muted hover:text-brand-text-main"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={clsx(
        "h-6 w-6 transition-all duration-300", 
        active ? "scale-110 drop-shadow-[0_0_8px_rgba(62,224,127,0.5)] stroke-[2.5px]" : "stroke-[2px]"
      )} />
      <span className={clsx(
        "text-[10px] font-bold tracking-wide",
        active && "text-glow-primary"
      )}>{label}</span>
      
      {active && (
        <motion.div 
          layoutId="mobile-nav-dot"
          className="absolute -top-3 h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(62,224,127,0.8)]"
        />
      )}
    </Link>
  );
}
