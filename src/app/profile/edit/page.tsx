import { getCurrentUser, updateUserProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateUserProfile} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  defaultValue={user.username}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="summonerName" className="text-sm font-medium">
                  Summoner Name
                </label>
                <input
                  type="text"
                  id="summonerName"
                  name="summonerName"
                  defaultValue={user.summonerName || ""}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="region" className="text-sm font-medium">
                  Region
                </label>
                <select
                  id="region"
                  name="region"
                  defaultValue={user.region || ""}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Region</option>
                  <option value="NA1">North America</option>
                  <option value="EUW1">Europe West</option>
                  <option value="EUN1">Europe Nordic & East</option>
                  <option value="KR">Korea</option>
                  <option value="BR1">Brazil</option>
                  <option value="LA1">Latin America North</option>
                  <option value="LA2">Latin America South</option>
                  <option value="OC1">Oceania</option>
                  <option value="RU">Russia</option>
                  <option value="TR1">Turkey</option>
                  <option value="JP1">Japan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  defaultValue={user.bio || ""}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  Save Changes
                </Button>
                <a href="/profile">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 