"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { FeedPost } from "@/lib/db";
import { useIsMobile } from "@/hooks/use-mobile";
import Post from "./Post";

const ROW_GAP = 20;

export function VirtualPostList({ posts, now }: { posts: FeedPost[]; now: number }) {
  const columns = useIsMobile() ? 1 : 2;
  const rows = useMemo(() => {
    const result: FeedPost[][] = [];
    for (let i = 0; i < posts.length; i += columns) result.push(posts.slice(i, i + columns));
    return result;
  }, [posts, columns]);

  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setScrollMargin(el.getBoundingClientRect().top + window.scrollY));
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 420,
    overscan: 3,
    gap: ROW_GAP,
    scrollMargin,
    getItemKey: (index) => rows[index].map((p) => p.id).join(":"),
  });

  return (
    <div ref={listRef}>
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            data-index={item.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 grid w-full items-start gap-5 md:grid-cols-2"
            style={{ transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)` }}
          >
            {rows[item.index].map((post) => (
              <Post key={post.id} post={post} now={now} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
