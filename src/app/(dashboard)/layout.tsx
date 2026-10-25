import React from "react";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { QueryProvider } from "@/wrappers/QueryProvider";
import { Heartbeat } from "@/components/presence/Heartbeat";
import { ReportBugDialog } from "@/features/report-bug/ReportBugDialog";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <QueryProvider>
      <Heartbeat />
      <div className="relative isolate min-h-screen bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] overflow-hidden">
          <div className="absolute -top-[420px] left-1/2 size-[1100px] -translate-x-1/2 rounded-full bg-glow/15 blur-[160px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_3%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_3%,transparent)_1px,transparent_1px)] bg-size-[72px_72px] mask-[radial-gradient(ellipse_at_50%_0%,black_10%,transparent_70%)]" />
        </div>
        <Navbar />
        {children}
      </div>
      <ReportBugDialog />
    </QueryProvider>
  );
};

export default DashboardLayout;
