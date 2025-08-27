'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { 
  getUserInitials, 
  getUserDisplayName, 
  getFormattedRank, 
  getUserAvatarUrl,
  type AuthUser 
} from "@/auth";

interface UserDropdownProps {
  user: AuthUser;
}

export function UserDropdown({ user }: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* User Display Name */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">
              {getUserDisplayName(user)}
            </span>
            {user.soloRank && (
              <span className="text-xs text-muted-foreground">
                {getFormattedRank(user.soloRank)}
              </span>
            )}
          </div>
          
          {/* User Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={getUserAvatarUrl(user)} 
              alt={`${getUserDisplayName(user)}'s avatar`} 
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getUserInitials(user.name, user.username)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {getUserDisplayName(user)}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/edit">Edit Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 