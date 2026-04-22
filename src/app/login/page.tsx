import LoginButtons from "./_components/LoginButtons";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const rawFrom = sp?.from;
  const from = Array.isArray(rawFrom) ? rawFrom[0] : rawFrom;
  const rawError = sp?.error;
  const error = Array.isArray(rawError) ? rawError[0] : rawError;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full">
        <h1 className="text-3xl font-bold tracking-tight">codelearn</h1>
        <p className="mt-2 text-sm text-zinc-400">サインインして学習を続けよう。</p>

        {error ? (
          <p className="mt-6 rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-8">
          <LoginButtons from={from ?? null} />
        </div>
      </div>
    </div>
  );
}
