"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Form from "./components/Form";
import { User } from "@/db/schema";
import { useState } from "react";

const CreatePost = ({ user }: { user: User }) => {
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false);
  return (
    <div className="bg-card rounded-lg p-4">
      <Dialog open={shouldOpenDialog} onOpenChange={setShouldOpenDialog}>
        <DialogTrigger>Create your post</DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>Create your post</DialogTitle>
          <Form user={user as User} setShouldOpenDialog={setShouldOpenDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePost;
