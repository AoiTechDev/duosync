import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { isProfileComplete } from "@/auth/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  // If no user, middleware should have redirected to login
  // But let's be safe
  if (!user) {
    redirect("/login");
  }

  // Check if profile is complete
  if (!isProfileComplete(user)) {
    redirect("/onboarding");
  }

  // Profile is complete, render dashboard
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Welcome to your dashboard!</p>
      {/* Add your dashboard content here */}
    </div>
  );
}