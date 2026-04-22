import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { z } from "zod";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  code: z.string().min(1).max(20000),
});

type RunResult = {
  stdout: string;
  stderr: string;
  timedOut: boolean;
  exitCode: number | null;
};

const TIMEOUT_MS = 5_000;
const MAX_OUTPUT = 100_000;

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "codelearn-"));
  const file = path.join(tmpDir, `run-${crypto.randomBytes(4).toString("hex")}.ts`);
  await fs.writeFile(file, parsed.data.code, "utf8");

  try {
    const result = await runTsx(file);
    return Response.json(result);
  } finally {
    fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

function runTsx(file: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["--yes", "tsx", file], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_OPTIONS: "" },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => {
      if (stdout.length < MAX_OUTPUT) stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      if (stderr.length < MAX_OUTPUT) stderr += chunk.toString("utf8");
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.slice(0, MAX_OUTPUT),
        stderr: stderr.slice(0, MAX_OUTPUT),
        timedOut,
        exitCode: code,
      });
    });
  });
}
