"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { sections, secondaryItems } from "@/app/(app)/_components/nav-items";

export default function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const currentSection = sections.find((s) => isActive(s.href) || s.subItems.some((si) => isActive(si.href)));

  return (
    <nav className="mt-2 flex flex-1 flex-col gap-6 px-1">
      {sections.map((section) => {
        const Icon = section.icon;
        const active = currentSection?.id === section.id;

        return (
          <div key={section.id}>
            <Link
              href={section.href}
              className={clsx(
                "group relative flex items-center gap-4 rounded-xl px-4 py-3 sf-text-body transition-colors duration-200 outline-none",
                active
                  ? "bg-white/12 font-medium text-apple-link-dark"
                  : "font-normal text-white/72 hover:bg-white/8 hover:text-white"
              )}
            >
              <Icon className={clsx("h-5 w-5", active ? "stroke-[2.5px]" : "stroke-[2.05px]")} />
              <span className="tracking-wide">{section.label}</span>
            </Link>

            {active && section.subItems.length > 0 && (
              <div className="ml-2 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                {section.subItems.map((item) => {
                  const SubIcon = item.icon;
                  const itemActive = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 sf-text-caption transition-colors outline-none",
                        itemActive
                          ? "bg-white/10 font-medium text-white"
                          : "text-white/60 hover:bg-white/6 hover:text-white/80"
                      )}
                    >
                      <SubIcon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-auto space-y-1 pt-4 border-t border-white/8">
        <p className="apple-kicker px-4 pb-1 text-white/40">Otros</p>
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group relative flex items-center gap-4 rounded-xl px-4 py-3 sf-text-body transition-colors duration-200 outline-none",
                active
                  ? "bg-white/12 font-medium text-apple-link-dark"
                  : "font-normal text-white/60 hover:bg-white/8 hover:text-white/80"
              )}
            >
              <Icon className={clsx("h-5 w-5", active ? "stroke-[2.5px]" : "stroke-[2.05px]")} />
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
