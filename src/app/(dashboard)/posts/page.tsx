import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { isProfileComplete } from "@/auth/utils";
import CreatePost from "@/features/create-post/CreatePost";
import PostsList from "@/features/post-list/Posts";

export default async function PostPage() {
  const user = await getCurrentUser();


  if (!user) {
    redirect("/login");
  }

  if (!isProfileComplete(user)) {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <CreatePost user={user} />
      <PostsList user={user}/>
    </div>
  );
}
