"use client";
import { PostWithAuthor } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Post from "./components/Post";

const Posts = () => {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts");
      return await response.json();
    },
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (isFetching) return <div>Fetching...</div>;

  return (
    <div className="space-y-4">
      {data.map((post: PostWithAuthor) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
