import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from "@/auth";
import { ServerUserDropdown } from "./ServerUserDropdown";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <div className="sticky h-16 top-0 left-0 right-0 z-50 bg-background border-b border-border px-6 md:px-12">
      <div className="flex items-center justify-between h-full">
        {/* Logo */}
        <div className="h-10 w-10 relative">
          <Image 
            src="/logo.jpeg" 
            alt="DuoSync logo" 
            fill 
            className="object-cover rounded-md" 
          />
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <ServerUserDropdown user={user} />
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Not signed in</span>
              <Avatar>
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 