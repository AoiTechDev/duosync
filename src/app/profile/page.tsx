import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Name:</strong> {user.name || "Not set"}</p>
              <p><strong>Summoner Name:</strong> {user.summonerName || "Not set"}</p>
              <p><strong>Region:</strong> {user.region || "Not set"}</p>
              <p><strong>Current Rank:</strong> {user.currentRank || "Not set"}</p>
              <p><strong>Main Role:</strong> {user.mainRole || "Not set"}</p>
              <p><strong>Bio:</strong> {user.bio || "Not set"}</p>
              <p><strong>Created:</strong> {user.createdAt?.toLocaleDateString()}</p>
            </div>
            
            <div className="flex gap-2">
              <form action={signOutAction}>
                <Button type="submit" variant="destructive">
                  Sign Out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 