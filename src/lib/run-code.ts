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
  return runInIframe(js);
}

function runInIframe(js: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.sandbox.add("allow-scripts");
    iframe.style.display = "none";

    let settled = false;
    const finish = (result: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      window.removeEventListener("message", handler);
      iframe.remove();
      const truncate = (s: string) => (s.length > MAX_OUTPUT ? s.slice(0, MAX_OUTPUT) : s);
      resolve({
        stdout: truncate(result.stdout),
        stderr: truncate(result.stderr),
        timedOut: result.timedOut,
        exitCode: result.exitCode,
      });
    };

    const handler = (event: MessageEvent) => {
      if (!iframe.contentWindow || event.source !== iframe.contentWindow) return;
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

    const timer = setTimeout(() => {
      finish({ stdout: "", stderr: "", timedOut: true, exitCode: null });
    }, TIMEOUT_MS);

    window.addEventListener("message", handler);

    const html = buildIframeHtml(js);
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
}

function buildIframeHtml(js: string): string {
  // Escape "</script" so user code containing it cannot break out of the
  // outer <script> tag in srcdoc and abort iframe initialization.
  const payload = JSON.stringify(js).replace(/<\/(script)/gi, "<\\/$1");
  return `<!doctype html><html><body><script>
(function(){
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
  console.log = function(){ stdout.push(fmt(arguments)); };
  console.info = function(){ stdout.push(fmt(arguments)); };
  console.debug = function(){ stdout.push(fmt(arguments)); };
  console.error = function(){ stderr.push(fmt(arguments)); };
  console.warn = function(){ stderr.push(fmt(arguments)); };
  var sent = false;
  function send(payload){
    if (sent) return;
    sent = true;
    parent.postMessage(payload, "*");
  }
  function joined(arr){ return arr.join("\\n") + (arr.length ? "\\n" : ""); }
  function done(exitCode, errText){
    send({
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
    // Synchronous failure (e.g. SyntaxError from AsyncFunction construction).
    done(1, (e && e.stack) ? String(e.stack) : String(e));
  }
})();
</script></body></html>`;
}
