"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { signOutAction } from "@/app/actions/auth";
import { 
  User, 
  Mail, 
  MapPin, 
  Gamepad2, 
  Trophy, 
  Settings,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Target,
  Swords
} from "lucide-react";
import Image from "next/image";
import { ROLES, GOALS, PLAYSTYLE_TAGS, COMMUNICATION_PREFERENCES } from "@/data/preferences";

interface User {
  id: string;
  email: string;
  username: string;
  name?: string | null;
  image?: string | null;
  summonerName?: string | null;
  region?: string | null;
  soloRank?: string | null;
  flexRank?: string | null;
  mainRole?: string | null;
  secondaryRole?: string | null;
  bio?: string | null;
  goals?: string[] | null;
  communication?: string[] | null;
  playstyle?: string[] | null;
  createdAt?: Date | null;
}

interface ProfilePageClientProps {
  user: User;
}

const regions = [
  { value: "NA1", label: "North America", flag: "🇺🇸" },
  { value: "EUW1", label: "Europe West", flag: "🇪🇺" },
  { value: "EUN1", label: "Europe Nordic & East", flag: "🇪🇺" },
  { value: "KR", label: "Korea", flag: "🇰🇷" },
  { value: "BR1", label: "Brazil", flag: "🇧🇷" },
  { value: "LA1", label: "Latin America North", flag: "🇲🇽" },
  { value: "LA2", label: "Latin America South", flag: "🇦🇷" },
  { value: "OC1", label: "Oceania", flag: "🇦🇺" },
  { value: "RU", label: "Russia", flag: "🇷🇺" },
  { value: "TR1", label: "Turkey", flag: "🇹🇷" },
  { value: "JP1", label: "Japan", flag: "🇯🇵" },
];

function getRankDisplayName(rank: string | null): string {
  if (!rank) return "Unranked";
  return rank.replace("_", " ");
}

function getRankImage(rank: string | null): string {
  if (!rank) return "/ranks/IRON.png";
  const tierName = rank.split("_")[0];
  return `/ranks/${tierName}.png`;
}

function RiotVerificationSection({ user }: { user: User }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isRiotConnected = Boolean(user.summonerName);

  const handleVerify = async () => {
    if (!gameName.trim() || !tagLine.trim()) return;

    setIsVerifying(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/verify-summoner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName: gameName.trim(),
          tagLine: tagLine.trim(),
          region: user.region,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setError("");
        // Optionally trigger a page refresh or update user data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(result.message || "Account not found");
      }
    } catch {
      setError("Failed to verify account");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isRiotConnected) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Riot Account Connected</h3>
                <p className="text-sm text-green-700">{user.summonerName}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertCircle className="w-5 h-5" />
          Connect Your Riot Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-orange-700">
          Connect your League of Legends account to verify your rank and show your gaming profile.
        </p>
        
        {success ? (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span>Account verified successfully! Refreshing...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input
                value={gameName}
                onChange={(e) => {
                  setGameName(e.target.value);
                  setError("");
                }}
                placeholder="Game Name"
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-400">#</span>
                <Input
                  value={tagLine}
                  onChange={(e) => {
                    setTagLine(e.target.value);
                    setError("");
                  }}
                  placeholder="TAG"
                  className="w-24"
                  maxLength={5}
                />
                <Button
                  onClick={handleVerify}
                  disabled={!gameName.trim() || !tagLine.trim() || isVerifying}
                  className="min-w-[100px]"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PreferenceBadge({ preference, type }: { preference: string; type: 'role' | 'goal' | 'playstyle' | 'communication' }) {
  let data: { id: string; name: string; icon?: string } | undefined = undefined;
  let icon = null;

  switch (type) {
    case 'role':
      data = ROLES.find(r => r.id === preference);
      if (data?.icon) {
        icon = <Image src={data.icon} alt={data.name} width={16} height={16} />;
      }
      break;
    case 'goal':
      data = GOALS.find(g => g.id === preference);
      break;
    case 'playstyle':
      data = PLAYSTYLE_TAGS.find(p => p.id === preference);
      break;
    case 'communication':
      data = COMMUNICATION_PREFERENCES.find(c => c.id === preference);
      break;
  }

  if (!data) return null;

  return (
    <Badge variant="secondary" className="flex items-center gap-1.5">
      {icon}
      <span>{data.name}</span>
    </Badge>
  );
}

export function ProfilePageClient({ user }: ProfilePageClientProps) {
  const regionData = regions.find(r => r.value === user.region);
  const memberSince = user.createdAt ? user.createdAt.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  }) : "Unknown";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your DuoSync profile and preferences</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <form action={signOutAction}>
              <Button type="submit" variant="destructive" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Riot Account Verification */}
        <RiotVerificationSection user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{user.username}</h3>
                    <p className="text-sm text-muted-foreground">
                      Member since {memberSince}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  
                  {user.region && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="mr-1">{regionData?.flag}</span>
                      <span>{regionData?.label || user.region}</span>
                    </div>
                  )}
                  
                  {user.name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{user.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rank Information */}
            {(user.soloRank || user.flexRank) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Current Rank
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.soloRank && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src={getRankImage(user.soloRank)}
                          alt={getRankDisplayName(user.soloRank)}
                          width={32}
                          height={32}
                        />
                        <div>
                          <p className="text-sm font-medium">Solo/Duo</p>
                          <p className="text-lg font-bold text-primary">
                            {getRankDisplayName(user.soloRank)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user.flexRank && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src={getRankImage(user.flexRank)}
                          alt={getRankDisplayName(user.flexRank)}
                          width={32}
                          height={32}
                        />
                        <div>
                          <p className="text-sm font-medium">Flex Queue</p>
                          <p className="text-lg font-bold text-primary">
                            {getRankDisplayName(user.flexRank)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preferences & Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Roles */}
            {(user.mainRole || user.secondaryRole) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="w-5 h-5" />
                    Preferred Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.mainRole && (
                      <div className="flex items-center gap-2">
                        <PreferenceBadge preference={user.mainRole} type="role" />
                        <Badge variant="outline" className="text-xs">Primary</Badge>
                      </div>
                    )}
                    {user.secondaryRole && (
                      <div className="flex items-center gap-2">
                        <PreferenceBadge preference={user.secondaryRole} type="role" />
                        <Badge variant="outline" className="text-xs">Secondary</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals */}
            {user.goals && user.goals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Goals & Motivation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.goals.map((goal) => (
                      <PreferenceBadge key={goal} preference={goal} type="goal" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Communication Preferences */}
            {user.communication && user.communication.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Communication Style
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.communication.map((comm) => (
                      <PreferenceBadge key={comm} preference={comm} type="communication" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Playstyle Tags */}
            {user.playstyle && user.playstyle.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Playstyle Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.playstyle.map((style) => (
                      <PreferenceBadge key={style} preference={style} type="playstyle" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bio Section */}
            {user.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    About Me
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{user.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Empty State for Missing Preferences */}
            {(!user.goals || user.goals.length === 0) && 
             (!user.communication || user.communication.length === 0) && 
             (!user.playstyle || user.playstyle.length === 0) && (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Complete Your Profile</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your gaming preferences to help others find you as the perfect duo partner!
                    </p>
                    <Button variant="outline">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Complete Profile Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
