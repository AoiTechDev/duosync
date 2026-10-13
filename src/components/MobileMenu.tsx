"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FriendRequestsList, useInboundRequests } from "./friends/FriendRequestsList";
import { RequestCount } from "./FriendsDropdown";

const LINKS = [
  { href: "/posts", label: "Feed" },
  { href: "/profile", label: "Profile" },
  { href: "/profile/edit", label: "Edit profile" },
];

/** Phone navigation: slides in from the right. `userBlock` is rendered on the server. */
export function MobileMenu({ userBlock }: { userBlock: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data } = useInboundRequests();
  const count = data?.items.length ?? 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="relative flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-border bg-card/70 md:hidden"
      >
        <Menu className="size-[18px]" />
        <span className="absolute -top-1.5 -right-1.5">
          <RequestCount count={count} />
        </span>
      </SheetTrigger>
      <SheetContent
        aria-describedby={undefined}
        side="right"
        className="flex w-[300px] flex-col gap-0 border-l border-border bg-background/95 p-0 backdrop-blur-xl [&>button:last-child]:hidden"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <SheetTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
            Menu
          </SheetTitle>
          <SheetClose className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>

        <div className="px-5 pt-5 pb-4">{userBlock}</div>

        <nav className="space-y-1.5 border-t border-border px-3 pt-4">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`block rounded-xl border px-4 py-3 text-[15px] font-semibold transition-colors ${
                  active
                    ? "border-primary/60 bg-primary/[0.07] text-primary shadow-[0_0_14px_color-mix(in_oklab,var(--primary)_20%,transparent)]"
                    : "border-transparent hover:bg-card"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <section className="mx-3 mt-4 overflow-hidden rounded-2xl border border-border bg-card/70">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="font-display text-xs font-black uppercase">Friend requests</span>
            <RequestCount count={count} />
          </div>
          <div className="max-h-64 overflow-y-auto border-t border-border">
            <FriendRequestsList compact />
          </div>
        </section>

        <div className="mt-auto border-t border-border px-3 py-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
