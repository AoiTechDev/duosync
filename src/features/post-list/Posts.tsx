"use client";
import { PostWithAuthor, User } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import Post from "./components/Post";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PostSkeleton from "@/components/PostSkeleton";
import { useFormStore } from "@/store/create-post-store";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import EditForm from "./components/EditForm";



const PostsError = ({
  error,
  refetch,
  isRefetching,
}: {
  error: Error;
  refetch: () => void;
  isRefetching: boolean;
}) => {
  const getErrorMessage = (error: Error) => {
    if (error.message.includes("fetch")) {
      return {
        title: "Connection Error",
        description:
          "Unable to connect to the server. Please check your internet connection.",
        icon: <Wifi className="h-5 w-5" />,
      };
    }
    if (error.message.includes("404")) {
      return {
        title: "Posts Not Found",
        description: "The requested posts could not be found.",
        icon: <AlertCircle className="h-5 w-5" />,
      };
    }
    return {
      title: "Something went wrong",
      description:
        error.message || "An unexpected error occurred while loading posts.",
      icon: <AlertCircle className="h-5 w-5" />,
    };
  };

  const errorInfo = getErrorMessage(error);

  return (
    <Card className="max-w-2xl mx-auto border border-destructive/20 bg-destructive/5">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            {errorInfo.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">{errorInfo.title}</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {errorInfo.description}
            </p>
          </div>
          <Button
            onClick={refetch}
            disabled={isRefetching}
            variant="outline"
            className="mt-2"
          >
            {isRefetching ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Posts = ({ user }: { user: User }) => {
  const { data, error, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("4")) {
        return false;
      }

      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  
  if (isLoading) {
    return <PostSkeleton />;
  }

  
  if (isError && error) {
    return (
      <PostsError error={error} refetch={refetch} isRefetching={isFetching} />
    );
  }

  const { shouldOpenEditDialog, setShouldOpenEditDialog, postId } = useFormStore();

  return (
    <div className="space-y-4">
      
      {isFetching && (
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Updating posts...
          </div>
        </div>
      )}

      {data && data.length > 0 ? (
        <>
          {data.map((post: PostWithAuthor) => (
            <Post key={post.id} post={post} user={user} />
          ))}
          <Dialog open={shouldOpenEditDialog} onOpenChange={setShouldOpenEditDialog}>
            <DialogContent className="sm:max-w-2xl">
              <DialogTitle>Edit your post</DialogTitle>
              <DialogDescription>
                Make changes to your post. Click save when you&apos;re done.
              </DialogDescription>
              {postId && <EditForm postId={postId} />}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Card className="max-w-2xl mx-auto border border-border/30 bg-card">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-muted">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">No posts yet</h3>
                <p className="text-muted-foreground text-sm">
                  Be the first to create a post and find your duo partner!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Posts;
