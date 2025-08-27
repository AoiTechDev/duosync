'use client'

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <DropdownMenuItem
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
    >
      Sign out
    </DropdownMenuItem>
  );
} 