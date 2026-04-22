"use client";

import useSWR from "swr";

type ProgressResponse = { lessonIds: string[] };

export function useProgress() {
  const { data, error, isLoading, mutate } = useSWR<ProgressResponse>("/api/progress");

  return {
    data: data?.lessonIds ?? [],
    error,
    isLoading,
    mutate,
  };
}
