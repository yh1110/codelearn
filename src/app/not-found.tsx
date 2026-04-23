import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <FileQuestion className="size-5" aria-hidden />
            <CardTitle>ページが見つかりません</CardTitle>
          </div>
          <CardDescription>
            お探しのページは存在しないか、移動または削除された可能性があります。
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Link href="/" className={buttonVariants({ variant: "default" })}>
            <Home className="size-4" aria-hidden />
            ホームへ戻る
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
