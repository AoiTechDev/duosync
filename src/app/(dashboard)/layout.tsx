import React from "react";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";

const FeedLayout = async ({ children }: { children: React.ReactNode }) => {

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <>
  <Navbar/>
  {children}</>;
};

export default FeedLayout;
