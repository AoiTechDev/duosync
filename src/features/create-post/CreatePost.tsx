"use client";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/db/schema";
import { useFormStore } from "@/store/create-post-store";
import { PostForm, postDialogClass } from "@/features/post-form/PostForm";

const CreatePost = ({ user }: { user: User }) => {
  const { shouldOpenCreateDialog, setShouldOpenCreateDialog } = useFormStore();

  return (
    <>
      <section className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-r from-primary/[0.07] via-card/80 to-card/80 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="pointer-events-none absolute -right-10 bottom-0 h-full w-56 -skew-x-[24deg] bg-linear-to-r from-transparent via-accent/10 to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="relative hidden h-12 w-[76px] shrink-0 sm:block">
            <div className="absolute top-1 left-0 flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-card">
              <Image src="/lane-icons/mid-icon.png" alt="" width={22} height={22} />
            </div>
            <div className="absolute top-0 left-7 size-12">
              <Image src="/ranks/DIAMOND.png" alt="" fill sizes="48px" className="object-contain" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl font-black uppercase tracking-[-0.02em] sm:text-2xl">
              Post a duo request
            </h2>
            <p className="text-sm text-muted-foreground">
              Say what you need: role, minimum rank, region. Your rank card does the rest.
            </p>
          </div>
        </div>
        <Button className="relative shrink-0" onClick={() => setShouldOpenCreateDialog(true)}>
          <Plus /> Create request
        </Button>
      </section>

      <Dialog open={shouldOpenCreateDialog} onOpenChange={setShouldOpenCreateDialog}>
        <DialogContent showCloseButton={false} className={postDialogClass}>
          <PostForm
            mode="create"
            initial={{ description: "", role: null, rank: null, region: user.region ?? null }}
            onDone={() => setShouldOpenCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;
