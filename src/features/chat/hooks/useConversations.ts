import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getConversations, getInboxVersion } from "../api";

export const CONVERSATIONS_KEY = ["conversations"];
const INBOX_VERSION_KEY = ["conversations", "version"];

/**
 * The full list is keyed by the inbox version, so it refetches only when the server says something
 * changed. Without Redis the version is null and the list falls back to plain 5s polling.
 */
export function useConversations() {
  const version = useQuery({
    queryKey: INBOX_VERSION_KEY,
    queryFn: getInboxVersion,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  const v = version.data?.version ?? null;

  return useQuery({
    queryKey: [...CONVERSATIONS_KEY, "list", v],
    queryFn: getConversations,
    enabled: version.isFetched,
    placeholderData: keepPreviousData,
    refetchInterval: v === null ? 5000 : 60_000,
    refetchOnWindowFocus: true,
    staleTime: v === null ? 0 : 60_000,
  });
}
