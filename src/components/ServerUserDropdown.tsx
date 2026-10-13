import Link from "next/link";
import Image from "next/image";
import { LayoutList, Pencil, UserRound, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseRank } from "@/lib/rank";
import { getUserInitials, getUserAvatarUrl, type AuthUser } from "@/auth";
import { SignOutButton } from "./SignOutButton";

const ITEMS = [
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/profile/edit", label: "Edit profile", icon: Pencil },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/feed", label: "Feed", icon: LayoutList },
];

export function UserAvatar({ user, size = 36 }: { user: AuthUser; size?: number }) {
  const rank = parseRank(user.soloRank);
  return (
    <span className="relative inline-flex">
      <Avatar className="ring-2 ring-primary/40" style={{ width: size, height: size }}>
        <AvatarImage src={getUserAvatarUrl(user)} alt="" />
        <AvatarFallback className="bg-linear-to-br from-primary to-accent text-xs font-black text-primary-foreground">
          {getUserInitials(user.name, user.username)}
        </AvatarFallback>
      </Avatar>
      {rank?.icon && (
        <span className="absolute -right-1 -bottom-1 flex size-[18px] items-center justify-center rounded-full border border-border bg-card">
          <Image src={rank.icon} alt="" width={12} height={12} />
        </span>
      )}
    </span>
  );
}

export function RiotTag({ summonerName }: { summonerName: string | null }) {
  if (!summonerName) return null;
  const [name, tag] = summonerName.split("#");
  return (
    <span className="font-mono">
      {name}
      {tag && <span className="text-electric">#{tag}</span>}
    </span>
  );
}

export function ServerUserDropdown({ user }: { user: AuthUser }) {
  const rank = parseRank(user.soloRank);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="cursor-pointer rounded-full outline-none transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <UserAvatar user={user} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 rounded-2xl border-border bg-popover/95 p-1.5 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl"
      >
        <DropdownMenuLabel className="flex items-center gap-3 px-2.5 py-2.5">
          {rank?.icon ? (
            <Image src={rank.icon} alt="" width={30} height={30} />
          ) : (
            <span className="size-[30px] rounded-full border border-dashed border-border" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user.username}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">
              <RiotTag summonerName={user.summonerName} />
              {!user.summonerName && "Riot ID not linked"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2">
            <Link href={href}>
              <Icon className="text-muted-foreground" /> {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border" />
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
