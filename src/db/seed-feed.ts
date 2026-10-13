import { and, eq, inArray, like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  friendRequests,
  friendships,
  posts,
  rankEnum,
  rankMinEnum,
  roleEnum,
  gameModeEnum,
  users,
  type Region,
} from "./schema";

const EMAIL_DOMAIN = "@seed.duosync.test";
const PLAYERS = 40;
const POSTS = 300;

const NAMES = [
  "wardsfirst", "flashonD", "baronbait", "minionmaster", "dragonsoul", "pentakid", "tiltproof", "jgdiff",
  "cspermin", "rotategod", "pinkward", "smitequeen", "midorfeed", "lanephase", "teleportTop", "drakeTimer",
  "visionscore", "pushwave", "backdoorbob", "nexusguard", "recallcancel", "goldfunnel", "sololaner", "duoabuser",
  "riftwalker", "shotcaller", "chillsupp", "hookcity", "kitearound", "frontliner", "scalingpick", "earlygank",
  "objectiveonly", "freezewave", "roamer", "splitpush", "peelbot", "engagebot", "macrobrain", "mechanicsgap",
];

const DESCRIPTIONS = [
  "Looking for a chill duo to climb this split. Voice preferred, no flame.",
  "Need a jungler who actually paths towards bot. Let's take every drake.",
  "Support main LF hyper-carry ADC. I play Thresh, Nautilus and Rakan.",
  "Grinding tonight for a few hours, want someone consistent who doesn't tilt.",
  "Learning the role, looking for someone patient to play normals with.",
  "Aggressive bot lane enjoyer. If you like level 2 all-ins, add me.",
  "Want to practice macro and rotations. Discord is a must.",
  "Weekend warrior, only play Fri-Sun evenings. Looking for a regular duo.",
  "ARAM brain rot session, anyone? Just fun, zero stress.",
  "Flex stack forming, need 1-2 more. Comms + good vibes.",
  "Top main who wants a jungler to camp me. I'll repay with TP plays.",
  "Mid main LF jungle duo, I roam a lot so be ready to follow up.",
  "Promos coming up, need a reliable partner. Please be on time.",
  "Late night EU player looking for someone also awake after midnight.",
  "Main ADC, shot calling in English or Polish. Let's go.",
];

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);
const TAGS: Record<string, string> = { EUW1: "EUW", EUN1: "EUNE", NA1: "NA1", KR: "KR1", BR1: "BR1", LA1: "LAN", LA2: "LAS" };
const REGIONS: Region[] = ["EUW1", "EUW1", "EUW1", "EUN1", "EUN1", "NA1", "NA1", "KR", "BR1", "LA1", "LA2"];
const LANES = roleEnum.enumValues.filter((r) => r !== "FILL");

async function clean() {
  const seeded = await db.select({ id: users.id }).from(users).where(like(users.email, `%${EMAIL_DOMAIN}`));
  const ids = seeded.map((u) => u.id);
  if (ids.length) {
    await db
      .delete(friendships)
      .where(or(inArray(friendships.userAId, ids), inArray(friendships.userBId, ids)));
    await db
      .delete(friendRequests)
      .where(or(inArray(friendRequests.senderId, ids), inArray(friendRequests.receiverId, ids)));
    await db.delete(posts).where(inArray(posts.authorId, ids));
    await db.delete(users).where(inArray(users.id, ids));
  }
  console.log(`Removed ${ids.length} seeded players and their posts`);
}

async function seed() {
  await clean();

  const players = await db
    .insert(users)
    .values(
      NAMES.slice(0, PLAYERS).map((username, i) => {
        const main = pick(LANES);
        const region = pick(REGIONS);
        return {
          email: `${username.toLowerCase()}${EMAIL_DOMAIN}`,
          username,
          summonerName: `${username}#${TAGS[region]}`,
          region,
          soloRank: pick(rankEnum.enumValues),
          flexRank: Math.random() < 0.5 ? pick(rankEnum.enumValues) : null,
          mainRole: main,
          secondaryRole: pick(LANES.filter((r) => r !== main)),
          bio: pick(DESCRIPTIONS),
          playstyle: [],
          communication: [],
          goals: [],
          lastSeenAt: i % 3 === 0 ? minutesAgo(Math.random() * 4) : minutesAgo(30 + Math.random() * 600),
        };
      }),
    )
    .returning({ id: users.id, region: users.region });

  await db.insert(posts).values(
    Array.from({ length: POSTS }, () => {
      const author = pick(players);
      const bumpedMinutesAgo = Math.random() * 115;
      const bumpedAt = minutesAgo(bumpedMinutesAgo);
      return {
        authorId: author.id,
        description: pick(DESCRIPTIONS),
        role: pick(LANES),
        rank: pick(rankMinEnum.enumValues.slice(0, 7)),
        region: author.region ?? "EUW1",
        gameMode: pick(gameModeEnum.enumValues),
        createdAt: minutesAgo(bumpedMinutesAgo + Math.random() * 60),
        bumpedAt,
        expiresAt: new Date(bumpedAt.getTime() + 2 * 60 * 60 * 1000),
      };
    }),
  );

  console.log(`Seeded ${players.length} players and ${POSTS} posts (live for up to 2h)`);
}

async function seedFriends(username: string) {
  const me = await db.query.users.findFirst({ where: eq(users.username, username), columns: { id: true } });
  if (!me) throw new Error(`No user named "${username}"`);

  const seeded = await db.select({ id: users.id }).from(users).where(like(users.email, `%${EMAIL_DOMAIN}`));
  if (seeded.length < 15) throw new Error("Run `bun db:seed:feed` first, there are not enough dummy players");
  const ids = seeded.map((u) => u.id).sort(() => Math.random() - 0.5);

  await db
    .delete(friendships)
    .where(
      or(
        and(eq(friendships.userAId, me.id), inArray(friendships.userBId, ids)),
        and(eq(friendships.userBId, me.id), inArray(friendships.userAId, ids)),
      ),
    );
  await db
    .delete(friendRequests)
    .where(
      or(
        and(eq(friendRequests.senderId, me.id), inArray(friendRequests.receiverId, ids)),
        and(eq(friendRequests.receiverId, me.id), inArray(friendRequests.senderId, ids)),
      ),
    );

  const friends = ids.slice(0, 8);
  const incoming = ids.slice(8, 13);
  const sent = ids.slice(13, 17);

  await db.insert(friendships).values(
    friends.map((id, i) => {
      const [userAId, userBId] = id < me.id ? [id, me.id] : [me.id, id];
      return { userAId, userBId, createdAt: minutesAgo((i + 1) * 60 * 24 * 3) };
    }),
  );
  await db.insert(friendRequests).values([
    ...friends.map((id, i) => ({
      senderId: i % 2 ? me.id : id,
      receiverId: i % 2 ? id : me.id,
      status: "ACCEPTED" as const,
      createdAt: minutesAgo((i + 1) * 60 * 24 * 3 + 30),
    })),
    ...incoming.map((id, i) => ({ senderId: id, receiverId: me.id, createdAt: minutesAgo(5 + i * 90) })),
    ...sent.map((id, i) => ({ senderId: me.id, receiverId: id, createdAt: minutesAgo(20 + i * 240) })),
  ]);

  console.log(
    `${username}: ${friends.length} friends, ${incoming.length} incoming requests, ${sent.length} sent requests`,
  );
}

const friendsArg = process.argv.indexOf("--friends");
const run =
  friendsArg > -1
    ? () => seedFriends(process.argv[friendsArg + 1] ?? "")
    : process.argv.includes("--clean")
      ? clean
      : seed;
run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
