import { PostWithAuthor } from "@/lib/db";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Post = ({ post }: { post: PostWithAuthor }) => {
  // Simple date formatting without external dependency
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };
  const formatRank = (rank: string) => {
    return rank.replace("_", " ");
  };

  const getRankColor = (rank: string) => {
    const baseRank = rank.split("_")[0];
    switch (baseRank) {
      case "IRON":
        return "bg-slate-600 text-white";
      case "BRONZE":
        return "bg-amber-600 text-white";
      case "SILVER":
        return "bg-slate-400 text-white";
      case "GOLD":
        return "bg-yellow-500 text-white";
      case "PLATINUM":
        return "bg-teal-500 text-white";
      case "EMERALD":
        return "bg-emerald-500 text-white";
      case "DIAMOND":
        return "bg-blue-500 text-white";
      case "MASTER":
        return "bg-purple-600 text-white";
      case "GRANDMASTER":
        return "bg-red-600 text-white";
      case "CHALLENGER":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getRegionFlag = (region: string) => {
    switch (region) {
      case "NA1":
        return "🇺🇸";
      case "EUW1":
        return "🇪🇺";
      case "EUN1":
        return "🇪🇺";
      case "KR":
        return "🇰🇷";
      case "BR1":
        return "🇧🇷";
      case "LA1":
      case "LA2":
        return "🌎";
      default:
        return "🌍";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={post.author.image || post.author.avatar || ""}
                alt={`${post.author.username}'s avatar`}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.author.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {post.author.name || post.author.username}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                {post.author.summonerName && (
                  <span className="text-xs text-muted-foreground">
                    @{post.author.summonerName}
                  </span>
                )}
                <Badge className={getRankColor(post.rank)}>
                  {formatRank(post.rank)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getRegionFlag(post.region)} {post.region}
                </Badge>
              </div>
            </div>
          </div>
          <CardAction>
            <span className="text-sm text-muted-foreground">
              {formatRelativeTime(post.createdAt)}
            </span>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{post.description}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <span>💬</span>
              <span>Reply</span>
            </button>
            <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <span>❤️</span>
              <span>Like</span>
            </button>
          </div>
          {post.expiresAt && (
            <Badge variant="outline" className="text-xs">
              Expires {formatRelativeTime(post.expiresAt)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Post;
