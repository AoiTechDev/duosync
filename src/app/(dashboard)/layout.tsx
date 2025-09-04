import React from "react";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { QueryProvider } from "@/wrappers/QueryProvider";

const PostsLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <QueryProvider>
      <Navbar />
      {children}
    </QueryProvider>
  );
};

export default PostsLayout;
