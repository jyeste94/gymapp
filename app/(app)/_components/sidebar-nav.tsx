"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import { navItems } from "@/app/(app)/_components/nav-items";

export default function SidebarNav() {
  const pathname = usePathname();
  
  return (
    <nav className="mt-8 space-y-1.5 px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group relative"
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 shadow-[0_0_20px_rgba(62,224,127,0.05)]"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
            
            <div
              className={clsx(
                "relative flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300",
                isActive
                  ? "text-brand-primary"
                  : "text-brand-text-muted hover:text-brand-text-main"
              )}
            >
              <div
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-brand-primary text-brand-dark shadow-[0_0_15px_rgba(62,224,127,0.4)]"
                    : "bg-brand-dark border border-brand-border text-brand-text-muted group-hover:border-brand-primary/30 group-hover:text-brand-primary"
                )}
              >
                <Icon className={clsx("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className="tracking-wide">{item.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="sidebar-dot"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(62,224,127,0.8)]"
                />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
