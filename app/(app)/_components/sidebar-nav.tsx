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
    <nav className="flex flex-1 flex-col gap-1">
      {sections.map((section) => {
        const Icon = section.icon;
        const active = currentSection?.id === section.id;

        return (
          <div key={section.id}>
            <Link
              href={section.href}
              className={clsx(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 sf-text-body transition-all duration-200 outline-none",
                active
                  ? "bg-#FFC400-bg font-semibold text-#FFC400 dark:bg-#FFC400/10"
                  : "text-#050505-muted hover:bg-gray-100 hover:text-#050505 dark:text-white/60 dark:hover:bg-white/8 dark:hover:text-white"
              )}
            >
              <Icon className={clsx("h-5 w-5", active ? "text-#FFC400" : "")} />
              <span>{section.label}</span>
            </Link>

            {active && section.subItems.length > 0 && (
              <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-#FFC400/20 pl-2">
                {section.subItems.map((item) => {
                  const SubIcon = item.icon;
                  const itemActive = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 sf-text-caption transition-colors outline-none",
                        itemActive
                          ? "bg-#FFC400-bg font-medium text-#FFC400 dark:bg-#FFC400/10"
                          : "text-#050505-muted hover:bg-gray-50 hover:text-#050505 dark:text-white/50 dark:hover:bg-white/8 dark:hover:text-white/80"
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

      <div className="mt-auto space-y-0.5 pt-4 border-t border-gray-100 dark:border-white/10">
        <p className="px-3 pb-1 sf-text-nano font-medium uppercase tracking-wider text-gray-400 dark:text-white/40">General</p>
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 sf-text-body transition-all duration-200 outline-none",
                active
                  ? "bg-#FFC400-bg font-semibold text-#FFC400 dark:bg-#FFC400/10"
                  : "text-#050505-muted hover:bg-gray-100 hover:text-#050505 dark:text-white/60 dark:hover:bg-white/8 dark:hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
