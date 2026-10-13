import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { getRelation } from "@/lib/relations";
import { ProfileView } from "@/features/profile/ProfileView";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `${decodeURIComponent(username)} · DuoSync` };
}

export default async function PlayerPage({ params }: Props) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const username = decodeURIComponent((await params).username);
  if (username === me.username) redirect("/profile");

  const [player] = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      image: users.image,
      avatar: users.avatar,
      summonerName: users.summonerName,
      region: users.region,
      soloRank: users.soloRank,
      flexRank: users.flexRank,
      mainRole: users.mainRole,
      secondaryRole: users.secondaryRole,
      bio: users.bio,
      goals: users.goals,
      playstyle: users.playstyle,
      communication: users.communication,
      lastSeenAt: users.lastSeenAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!player) notFound();

  const viewer = await getRelation(me.id, player.id);
  const visible = viewer.relation === "friend" ? player : { ...player, summonerName: null };

  return <ProfileView user={visible} viewer={viewer} />;
}
