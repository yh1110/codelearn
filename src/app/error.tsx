"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" aria-hidden />
            <CardTitle>エラーが発生しました</CardTitle>
          </div>
          <CardDescription>
            一時的な問題の可能性があります。もう一度お試しいただくか、ホームへ戻ってください。
          </CardDescription>
        </CardHeader>
        {isDev && (
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
              {error.message}
              {error.digest && `\n\ndigest: ${error.digest}`}
            </pre>
          </CardContent>
        )}
        <CardFooter className="flex justify-end gap-2">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            <Home className="size-4" aria-hidden />
            ホームへ
          </Link>
          <Button onClick={reset} type="button">
            <RotateCcw className="size-4" aria-hidden />
            もう一度試す
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
