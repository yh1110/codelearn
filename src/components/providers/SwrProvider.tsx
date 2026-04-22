"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        onError: (error) => {
          // TODO: replace with toast once the toast system is introduced
          console.error("[SWR]", error);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
