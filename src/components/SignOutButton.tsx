"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutButton() {
  return (
    <DropdownMenuItem
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive [&_svg]:text-destructive"
    >
      <LogOut /> Sign out
    </DropdownMenuItem>
  );
}
