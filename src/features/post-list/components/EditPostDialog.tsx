"use client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useFormStore } from "@/store/create-post-store";
import { PostForm, postDialogClass } from "@/features/post-form/PostForm";

function EditPostForm({ postId, onDone }: { postId: string; onDone: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await fetch(`/api/get-post/${postId}`);
      if (!res.ok) throw new Error("Failed to load post");
      return res.json() as Promise<{ id: string; description: string | null; role: string; rank: string; region: string }>;
    },
  });

  if (isLoading || isError || !data) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <DialogTitle className="sr-only">Edit duo request</DialogTitle>
        {isError ? "Couldn't load this post." : <Loader2 className="size-5 animate-spin" />}
      </div>
    );
  }

  return (
    <PostForm
      key={data.id}
      mode="edit"
      postId={postId}
      initial={{ description: data.description ?? "", role: data.role, rank: data.rank, region: data.region }}
      onDone={onDone}
    />
  );
}

export function EditPostDialog() {
  const { shouldOpenEditDialog, setShouldOpenEditDialog, postId } = useFormStore();

  return (
    <Dialog open={shouldOpenEditDialog} onOpenChange={setShouldOpenEditDialog}>
      <DialogContent showCloseButton={false} aria-describedby={undefined} className={postDialogClass}>
        {postId && <EditPostForm postId={postId} onDone={() => setShouldOpenEditDialog(false)} />}
      </DialogContent>
    </Dialog>
  );
}
