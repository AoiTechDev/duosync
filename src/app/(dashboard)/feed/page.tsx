import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { isProfileComplete } from "@/auth/utils";
import CreateFeedPost from "@/features/create-feed-post/CreateFeedPost";

export default async function FeedPage() {
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
    <div className="container mx-auto py-8 max-w-3xl">
      <CreateFeedPost user={user} />
    </div>
  );
}
