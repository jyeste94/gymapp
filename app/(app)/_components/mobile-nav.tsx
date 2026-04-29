"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { sections, secondaryItems } from "@/app/(app)/_components/nav-items";

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const currentSection = sections.find((s) => isActive(s.href) || s.subItems.some((si) => isActive(si.href)));

  if (!currentSection || currentSection.id === "inicio") {
    return (
      <NavBar
        items={[
          { href: "/", label: "Inicio", icon: sections[0].icon },
          { href: "/routines", label: "Rutinas", icon: sections[1].icon },
          { href: "/diet", label: "Dieta", icon: sections[2].icon },
          { href: "/measurements", label: "Mediciones", icon: secondaryItems[0].icon },
          { href: "/progress", label: "Progreso", icon: sections[1].subItems[2].icon },
        ]}
        isActive={isActive}
      />
    );
  }

  if (currentSection.id === "rutinas") {
    return (
      <NavBar
        items={[
          { href: "/", label: "Inicio", icon: sections[0].icon },
          ...currentSection.subItems.map((si) => ({ href: si.href, label: si.label, icon: si.icon })),
        ]}
        isActive={isActive}
      />
    );
  }

  if (currentSection.id === "dieta") {
    return (
      <NavBar
        items={[
          { href: "/", label: "Inicio", icon: sections[0].icon },
          ...currentSection.subItems.map((si) => ({ href: si.href, label: si.label, icon: si.icon })),
        ]}
        isActive={isActive}
      />
    );
  }

  return null;
}

function NavBar({ items, isActive: checkActive }: {
  items: readonly { href: string; label: string; icon: React.ElementType }[];
  isActive: (href: string) => boolean;
}) {
  return (
    <nav
      className="pointer-events-none fixed inset-x-0 z-50 px-3 lg:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.7rem)" }}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[560px] rounded-2xl border border-gray-200/60 bg-white/95 px-2 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-[20px] dark:border-white/15 dark:bg-[#1a1a2e]/95">
        <ul className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = checkActive(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={clsx(
                    "relative flex min-h-[52px] w-full flex-col items-center justify-center gap-[2px] rounded-xl px-1 py-1.5 transition-all duration-200",
                    active
                      ? "bg-fitia-green text-white shadow-[0_2px_8px_rgba(76,175,80,0.3)]"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={clsx("h-[18px] w-[18px]")} strokeWidth={active ? 2.5 : 2} />
                  <span className={clsx("sf-text-nano font-medium", active ? "text-white" : "text-gray-500 dark:text-white/60")}>
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
