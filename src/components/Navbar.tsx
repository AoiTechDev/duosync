import Link from "next/link";
import { getCurrentUser } from "@/auth";
import { parseRank } from "@/lib/rank";
import { BrandLogo } from "./BrandLogo";
import { NavLinks } from "./NavLinks";
import { RiotTag, ServerUserDropdown, UserAvatar } from "./ServerUserDropdown";
import FriendsDropdown from "./FriendsDropdown";
import { MobileMenu } from "./MobileMenu";
import { UnreadMessagesButton } from "@/features/chat/components/UnreadMessagesButton";

export default async function Navbar() {
  const user = await getCurrentUser();
  const rank = parseRank(user?.soloRank);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      <div className="mx-auto flex h-full w-full max-w-[1120px] items-center justify-between px-5">
        <Link href="/feed" aria-label="DuoGG home">
          <BrandLogo />
        </Link>
        <NavLinks />
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <UnreadMessagesButton />
              <FriendsDropdown />
              <ServerUserDropdown user={user} />
            </div>
            <MobileMenu
              userBlock={
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} size={44} />
                  <div className="min-w-0">
                    <p className="truncate font-bold">{user.username}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      <RiotTag summonerName={user.summonerName} />
                      {user.summonerName && " · "}
                      {rank?.label ?? "Unranked"}
                    </p>
                  </div>
                </div>
              }
            />
          </div>
        )}
      </div>
    </header>
  );
}
