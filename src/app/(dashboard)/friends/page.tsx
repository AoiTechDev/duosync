import type { Metadata } from "next";
import { FriendsView } from "./FriendsView";

export const metadata: Metadata = { title: "Friends · DuoGG" };

export default function FriendsPage() {
  return <FriendsView />;
}
