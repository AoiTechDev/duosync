"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/posts", label: "Feed" },
  { href: "/profile", label: "Profile" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden h-full items-stretch gap-1 md:flex">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center px-4 text-sm font-semibold transition-colors ${
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {link.label}
            {active && (
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
