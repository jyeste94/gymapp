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
      <div className="pointer-events-auto mx-auto w-full max-w-[560px] rounded-[20px] border border-white/20 bg-[rgba(20,20,22,0.86)] px-2 py-2 shadow-[0_16px_36px_rgba(0,0,0,0.42)] backdrop-blur-[20px]">
        <ul className="grid gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = checkActive(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={clsx(
                    "relative flex min-h-[56px] w-full flex-col items-center justify-center gap-[3px] rounded-[14px] px-1 py-2 transition-all duration-200",
                    active
                      ? "bg-white text-apple-near-black shadow-[0_2px_10px_rgba(255,255,255,0.3)]"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={clsx("h-[19px] w-[19px]", active ? "text-apple-near-black" : "text-white/90")} strokeWidth={active ? 2.5 : 2.2} />
                  <span className={clsx("sf-text-nano tracking-[0.02em]", active ? "font-semibold text-apple-near-black" : "font-medium text-white/90")}>
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
