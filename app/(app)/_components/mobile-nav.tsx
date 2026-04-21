"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navItems } from "@/app/(app)/_components/nav-items";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 z-50 px-3 lg:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.7rem)" }}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[560px] rounded-[20px] border border-white/20 bg-[rgba(20,20,22,0.86)] px-2 py-2 shadow-[0_16px_36px_rgba(0,0,0,0.42)] backdrop-blur-[20px]">
        <ul className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={clsx(
                    "relative flex min-h-[56px] w-full flex-col items-center justify-center gap-[3px] rounded-[14px] px-1 py-2 transition-all duration-200",
                    isActive
                      ? "bg-white text-apple-near-black shadow-[0_2px_10px_rgba(255,255,255,0.3)]"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={clsx("h-[19px] w-[19px]", isActive ? "text-apple-near-black" : "text-white/90")} strokeWidth={isActive ? 2.5 : 2.2} />
                  <span className={clsx("sf-text-nano tracking-[0.02em]", isActive ? "font-semibold text-apple-near-black" : "font-medium text-white/90")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
