"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Form from "./components/Form";
import { User } from "@/db/schema";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFormStore } from "@/store/create-post-store";

const CreatePost = ({ user }: { user: User }) => {
  const { shouldOpenCreateDialog, setShouldOpenCreateDialog } = useFormStore();
  return (
    <Dialog open={shouldOpenCreateDialog} onOpenChange={setShouldOpenCreateDialog}>
      <DialogTrigger asChild>
        <Card className="mb-8 cursor-pointer group hover:scale-[1.02] max-w-2xl mx-auto transition-all duration-300 border-2 border-dashed border-primary/30 hover:border-primary/60 bg-gradient-to-r from-card/50 to-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-foreground mb-1">
                  Create Duo Request
                </div>
                <div className="text-sm text-muted-foreground">
                  Share your playstyle and find the perfect partner...
                </div>
              </div>
              <div className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                ⚡
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>Create your post</DialogTitle>
        <Form user={user as User} />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
