import "client-only";
import * as esbuild from "esbuild-wasm";
import { ESBUILD_WASM_URL, RUN_CODE_MAX_OUTPUT, RUN_CODE_TIMEOUT_MS } from "@/config/run-code";

export type RunResult = {
  stdout: string;
  stderr: string;
  timedOut: boolean;
  exitCode: number | null;
};

let initialized: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (!initialized) {
    initialized = esbuild.initialize({ wasmURL: ESBUILD_WASM_URL }).catch((error) => {
      initialized = null;
      throw error;
    });
  }
  return initialized;
}

export async function runCodeInBrowser(code: string): Promise<RunResult> {
  try {
    await ensureInit();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      stdout: "",
      stderr: `ランタイム初期化に失敗しました: ${message}`,
      timedOut: false,
      exitCode: 1,
    };
  }
  let js: string;
  try {
    const transformed = await esbuild.transform(code, {
      loader: "ts",
      target: "es2022",
    });
    js = transformed.code;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { stdout: "", stderr: message, timedOut: false, exitCode: 1 };
  }
  return runInWorker(js);
}

function runInWorker(js: string): Promise<RunResult> {
  const workerSrc = buildWorkerSource(js);
  const blob = new Blob([workerSrc], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);

  // TODO(#3): restrict worker-src / connect-src via CSP to block fetch / WS inside the worker.
  let worker: Worker;
  try {
    worker = new Worker(url, { type: "classic" });
  } catch (error) {
    URL.revokeObjectURL(url);
    const message = error instanceof Error ? error.message : String(error);
    return Promise.resolve({
      stdout: "",
      stderr: `Worker の起動に失敗しました: ${message}`,
      timedOut: false,
      exitCode: 1,
    });
  }

  return new Promise<RunResult>((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;
    // Buffer intermediate stdout/stderr so timeouts can still surface partial output.
    let partialStdout = "";
    let partialStderr = "";
    const finish = (result: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      const truncate = (s: string) =>
        s.length > RUN_CODE_MAX_OUTPUT ? s.slice(0, RUN_CODE_MAX_OUTPUT) : s;
      resolve({
        stdout: truncate(result.stdout),
        stderr: truncate(result.stderr),
        timedOut: result.timedOut,
        exitCode: result.exitCode,
      });
    };

    timer = setTimeout(() => {
      // Worker.terminate() reliably kills infinite loops (unlike iframe.remove()).
      finish({ stdout: partialStdout, stderr: partialStderr, timedOut: true, exitCode: null });
    }, RUN_CODE_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        stdout?: unknown;
        stderr?: unknown;
        exitCode?: unknown;
      } | null;
      if (!data) return;
      if (data.type === "chunk") {
        if (typeof data.stdout === "string") partialStdout = data.stdout;
        if (typeof data.stderr === "string") partialStderr = data.stderr;
        return;
      }
      if (data.type !== "done") return;
      finish({
        stdout: typeof data.stdout === "string" ? data.stdout : "",
        stderr: typeof data.stderr === "string" ? data.stderr : "",
        timedOut: false,
        exitCode: typeof data.exitCode === "number" ? data.exitCode : 0,
      });
    };
    worker.onerror = (event: ErrorEvent) => {
      finish({
        stdout: "",
        stderr: event.message || "Worker error",
        timedOut: false,
        exitCode: 1,
      });
    };
  });
}

function buildWorkerSource(js: string): string {
  const payload = JSON.stringify(js);
  return `(function(){
  var stdout = []; var stderr = [];
  function fmt(args){
    return Array.prototype.map.call(args, function(a){
      if (a === null) return "null";
      if (a === undefined) return "undefined";
      if (typeof a === "object") {
        try { return JSON.stringify(a); } catch (_e) { return String(a); }
      }
      return String(a);
    }).join(" ");
  }
  function joined(arr){ return arr.join("\\n") + (arr.length ? "\\n" : ""); }
  function flush(){
    // Stream partial output so the main thread can show it on timeout.
    self.postMessage({ type: "chunk", stdout: joined(stdout), stderr: joined(stderr) });
  }
  self.console = {
    log: function(){ stdout.push(fmt(arguments)); flush(); },
    info: function(){ stdout.push(fmt(arguments)); flush(); },
    debug: function(){ stdout.push(fmt(arguments)); flush(); },
    warn: function(){ stdout.push(fmt(arguments)); flush(); },
    error: function(){ stderr.push(fmt(arguments)); flush(); },
  };
  function done(exitCode, errText){
    self.postMessage({
      type: "done",
      stdout: joined(stdout),
      stderr: errText ? (joined(stderr) + errText) : joined(stderr),
      exitCode: exitCode
    });
  }
  try {
    // AsyncFunction lets user code use top-level await.
    var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    Promise.resolve()
      .then(function(){ return (new AsyncFunction(${payload}))(); })
      .then(function(){ done(0, ""); })
      .catch(function(e){ done(1, (e && e.stack) ? String(e.stack) : String(e)); });
  } catch (e) {
    done(1, (e && e.stack) ? String(e.stack) : String(e));
  }
})();`;
}
