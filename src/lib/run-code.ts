import "client-only";
import * as esbuild from "esbuild-wasm";

export type RunResult = {
  stdout: string;
  stderr: string;
  timedOut: boolean;
  exitCode: number | null;
};

const TIMEOUT_MS = 5_000;
const MAX_OUTPUT = 100_000;
const ESBUILD_VERSION = "0.28.0";
const WASM_URL = `https://unpkg.com/esbuild-wasm@${ESBUILD_VERSION}/esbuild.wasm`;

let initialized: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (!initialized) {
    initialized = esbuild.initialize({ wasmURL: WASM_URL }).catch((error) => {
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
  const worker = new Worker(url, { type: "classic" });

  return new Promise<RunResult>((resolve) => {
    let settled = false;
    const finish = (result: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      const truncate = (s: string) => (s.length > MAX_OUTPUT ? s.slice(0, MAX_OUTPUT) : s);
      resolve({
        stdout: truncate(result.stdout),
        stderr: truncate(result.stderr),
        timedOut: result.timedOut,
        exitCode: result.exitCode,
      });
    };

    const timer = setTimeout(() => {
      // Worker.terminate() reliably kills infinite loops (unlike iframe.remove()).
      finish({ stdout: "", stderr: "", timedOut: true, exitCode: null });
    }, TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        stdout?: unknown;
        stderr?: unknown;
        exitCode?: unknown;
      } | null;
      if (!data || data.type !== "done") return;
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
  self.console = {
    log: function(){ stdout.push(fmt(arguments)); },
    info: function(){ stdout.push(fmt(arguments)); },
    debug: function(){ stdout.push(fmt(arguments)); },
    warn: function(){ stderr.push(fmt(arguments)); },
    error: function(){ stderr.push(fmt(arguments)); },
  };
  function joined(arr){ return arr.join("\\n") + (arr.length ? "\\n" : ""); }
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
