import { PostWithAuthor, User } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, EllipsisVertical } from "lucide-react";
import { RANKS, ROLES } from "@/data/preferences";
import Image from "next/image";
import { regionsWithFlags } from "@/data/constants";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useFormStore } from "@/store/create-post-store";

const Post = ({ post, user }: { post: PostWithAuthor; user: User }) => {
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

  const isOwner = user?.id === post.author.id;

  const { setPostId, setShouldOpenEditDialog } = useFormStore();
  return (
    <Card
      key={post.id}
      className="group max-w-2xl mx-auto  border border-border/30  bg-card"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14  ">
              <AvatarImage
                src={post.author.image || post.author.avatar || ""}
                alt={`${post.author.username}'s avatar`}
              />
              <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold">
                {post.author.name?.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 relative">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-lg text-foreground ">
                {post.author.username}
              </h3>
              <Badge
                className={` text-white text-xs px-3 py-1 font-semibold shadow-md`}
              >
                {post.author.mainRole}
              </Badge>
              {post.author.soloRank && (
                <Badge
                  variant="outline"
                  className="text-xs font-semibold border-accent/50 text-accent"
                >
                  {post.author.soloRank}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(post.createdAt)}
              </div>
            </div>

            {isOwner && (
              <div className="absolute top-0 right-0">
                <DropdownMenu>
                  <DropdownMenuTrigger className="cursor-pointer">
                    <EllipsisVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setPostId(post.id);
                        setShouldOpenEditDialog(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <p className="text-foreground leading-relaxed text-base font-medium">
          {post.description}
        </p>

        <div className="bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl p-4 border border-border/20">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-bold text-foreground">Looking for:</h4>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center`}
              >
                <Image
                  src={ROLES.find((r) => r.id === post.role)?.icon || ""}
                  alt={post.author.mainRole || ""}
                  width={32}
                  height={32}
                />
              </div>
              <span className="font-semibold text-foreground">{post.role}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center`}
              >
                <Image
                  src={RANKS.find((r) => r.id === post.rank)?.icon || ""}
                  alt={post.rank || ""}
                  width={32}
                  height={32}
                />
              </div>
              <span className="font-medium">{post.rank}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              {regionsWithFlags.find((r) => r.value === post.region)?.flag}
              <span className="font-medium">{post.region}</span>
            </div>
          </div>
        </div>

        {/* <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground"></div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Send Request
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-background/50 border-border/50 hover:bg-card hover:border-primary/50 transition-all duration-300"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default Post;
