// Problem page — core screen with Monaco editor

const { useState, useEffect, useRef, useMemo, useCallback } = React;

function PageProblem() {
  const p = DATA.CURRENT_PROBLEM;
  const [leftTab, setLeftTab] = useState("problem");
  const [resultTab, setResultTab] = useState("sample");
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState(DATA.STARTERS.python);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);     // sample run
  const [submission, setSubmission] = useState(null); // submit
  const [customInput, setCustomInput] = useState("5 3\n1 2 3 4 5\n1 3\n2 5\n1 5");
  const [customOutput, setCustomOutput] = useState("");
  const [hintRevealed, setHintRevealed] = useState(1);
  const [toast, setToast] = useState(null);
  const [leftWidth, setLeftWidth] = useState(46); // %
  const [bottomHeight, setBottomHeight] = useState(240); // px

  // language switch updates starter (if user hasn't typed much)
  const switchLang = (newLang) => {
    if (!code.trim() || code === DATA.STARTERS[lang]) {
      setCode(DATA.STARTERS[newLang]);
    }
    setLang(newLang);
  };

  const runSample = () => {
    setResultTab("sample");
    setRunning(true);
    setResults(null);
    setTimeout(() => {
      // Mock result: match against 2 samples. We fake a pass if code contains 'prefix' or 'S[' hints
      const smart = /prefix|cum|accumulate|pre\s*\[|S\s*\[/i.test(code);
      const r = p.samples.map((s, i) => ({
        idx: i + 1,
        status: smart ? "ac" : (i === 0 ? "wa" : "ac"),
        time: smart ? `${12 + i * 4} ms` : "—",
        mem: smart ? `${12 + i}.2 MB` : "—",
        input: s.in,
        expected: s.out,
        actual: smart ? s.out : (i === 0 ? "0\n0\n0" : s.out),
      }));
      setResults(r);
      setRunning(false);
    }, 900);
  };

  const runCustom = () => {
    setResultTab("custom");
    setCustomOutput("… 実行中");
    setTimeout(() => {
      const smart = /prefix|cum|accumulate|pre\s*\[|S\s*\[/i.test(code);
      setCustomOutput(smart ? "6\n14\n15" : "0\n0\n0");
    }, 700);
  };

  const submit = () => {
    setResultTab("submit");
    setSubmitting(true);
    setSubmission(null);
    setTimeout(() => {
      const smart = /prefix|cum|accumulate|pre\s*\[|S\s*\[/i.test(code);
      const total = 12;
      const cases = Array.from({ length: total }).map((_, i) => {
        const visible = i < 2;
        let status = "ac";
        if (!smart) {
          if (i < 2) status = i === 0 ? "wa" : "ac";
          else if (i < 6) status = "tle";
          else status = "wa";
        }
        return {
          idx: i + 1,
          name: visible ? `sample_${i + 1}` : `hidden_${i - 1}`,
          status,
          time: status === "ac" ? `${8 + i * 2} ms` : status === "tle" ? "2.00 s" : `${4 + i} ms`,
          mem: status === "ac" ? `${10 + i * 0.3} MB` : `${48 + i} MB`,
        };
      });
      const passed = cases.filter(c => c.status === "ac").length;
      setSubmission({ cases, passed, total, verdict: passed === total ? "AC" : "WA" });
      setSubmitting(false);
      setToast({
        kind: passed === total ? "ok" : "err",
        text: passed === total ? "🎉 全ケース通過!" : `${passed}/${total} ケース通過`,
      });
      setTimeout(() => setToast(null), 3500);
    }, 1400);
  };

  // Resizable split
  const splitRef = useRef(null);
  const onDragLeft = useCallback((e) => {
    e.preventDefault();
    const move = (ev) => {
      const rect = splitRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(75, Math.max(25, pct)));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, []);

  const stackRef = useRef(null);
  const onDragBottom = useCallback((e) => {
    e.preventDefault();
    const move = (ev) => {
      const rect = stackRef.current.getBoundingClientRect();
      const h = rect.bottom - ev.clientY;
      setBottomHeight(Math.min(rect.height - 120, Math.max(120, h)));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, []);

  return (
    <div className="problem-shell page full">
      <div
        ref={splitRef}
        className="problem-split"
        style={{ gridTemplateColumns: `${leftWidth}% 4px minmax(420px, 1fr)` }}
      >
        {/* LEFT: Problem statement / tabs */}
        <div className="pane">
          <div className="pane-tabs" role="tablist">
            <button role="tab" aria-selected={leftTab === "problem"} onClick={() => setLeftTab("problem")}>
              <Icon name="doc" size={13} /> 問題
            </button>
            <button role="tab" aria-selected={leftTab === "hints"} onClick={() => setLeftTab("hints")}>
              <Icon name="lightbulb" size={13} /> ヒント <span className="count">{p.hints.length}</span>
            </button>
            <button role="tab" aria-selected={leftTab === "stats"} onClick={() => setLeftTab("stats")}>
              <Icon name="chart" size={13} /> 統計
            </button>
            <button role="tab" aria-selected={leftTab === "discuss"} onClick={() => setLeftTab("discuss")}>
              <Icon name="chat" size={13} /> 議論 <span className="count">12</span>
            </button>
            <button role="tab" aria-selected={leftTab === "history"} onClick={() => setLeftTab("history")}>
              <Icon name="clock" size={13} /> 提出履歴
            </button>
          </div>

          <div className="pane-body">
            {leftTab === "problem" && <ProblemStatement p={p} />}
            {leftTab === "hints" && <HintsPanel hints={p.hints} revealed={hintRevealed} onReveal={() => setHintRevealed(h => Math.min(p.hints.length, h + 1))} />}
            {leftTab === "stats" && <StatsPanel />}
            {leftTab === "discuss" && <DiscussPanel />}
            {leftTab === "history" && <HistoryPanel />}
          </div>
        </div>

        <div className="resizer" onMouseDown={onDragLeft} />

        {/* RIGHT: Editor + Results */}
        <div ref={stackRef} className="editor-stack"
          style={{ gridTemplateRows: `1fr 4px ${bottomHeight}px` }}>
          <div className="editor-wrap">
            <div className="editor-topbar">
              <div className="left">
                <select className="lang-select" value={lang} onChange={(e) => switchLang(e.target.value)}>
                  <option value="python">Python 3.11</option>
                  <option value="javascript">Node.js 20</option>
                  <option value="cpp">C++ 20 (g++)</option>
                  <option value="rust">Rust 1.76</option>
                </select>
                <span className="mono-sm muted" style={{ marginLeft: 4 }}>· main.{({python:"py",javascript:"js",cpp:"cpp",rust:"rs"})[lang]}</span>
              </div>
              <div className="right">
                <button className="btn btn-sm btn-ghost" onClick={() => setCode(DATA.STARTERS[lang])}>
                  <Icon name="trash" size={12} /> リセット
                </button>
                <button className="btn btn-sm btn-ghost"><Icon name="upload" size={12} /> アップロード</button>
                <button className="btn btn-sm btn-ghost" title="設定"><Icon name="settings" size={13} /></button>
              </div>
            </div>
            <MonacoEditor
              value={code}
              language={lang}
              onChange={setCode}
            />
          </div>

          <div className="resizer horizontal" onMouseDown={onDragBottom} />

          <div className="results-pane">
            <div className="pane-tabs" role="tablist">
              <button role="tab" aria-selected={resultTab === "sample"} onClick={() => setResultTab("sample")}>
                <Icon name="play" size={12} /> サンプル実行
                {results && <span className="count">{results.filter(r => r.status === "ac").length}/{results.length}</span>}
              </button>
              <button role="tab" aria-selected={resultTab === "custom"} onClick={() => setResultTab("custom")}>
                <Icon name="edit" size={12} /> カスタム入力
              </button>
              <button role="tab" aria-selected={resultTab === "submit"} onClick={() => setResultTab("submit")}>
                <Icon name="send" size={12} /> 提出結果
                {submission && (
                  <span className="count" style={{ color: submission.verdict === "AC" ? "var(--ok)" : "var(--err)" }}>
                    {submission.passed}/{submission.total}
                  </span>
                )}
              </button>
              <div className="spacer" />
              {running && <span className="mono-sm muted" style={{ padding: "0 10px" }}>
                <span className="pulse">●</span> 実行中…
              </span>}
            </div>

            <div className="results-body">
              {resultTab === "sample" && <SampleResults running={running} results={results} samples={p.samples} onRun={runSample} />}
              {resultTab === "custom" && <CustomRun input={customInput} setInput={setCustomInput} output={customOutput} onRun={runCustom} />}
              {resultTab === "submit" && <SubmitResults submitting={submitting} submission={submission} onSubmit={submit} />}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="problem-bottombar">
        <div className="left">
          <button className="btn btn-sm"><Icon name="arrowLeft" size={13} /> 前の問題</button>
          <button className="btn btn-sm">次の問題 <Icon name="arrowRight" size={13} /></button>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <span className="mono-sm muted">エディタの保存: <span style={{ color: "var(--ok)" }}>自動</span></span>
          <span className="mono-sm muted">·</span>
          <span className="mono-sm muted"><span className="kbd">⌘</span> <span className="kbd">S</span> サンプル</span>
          <span className="mono-sm muted">·</span>
          <span className="mono-sm muted"><span className="kbd">⌘</span> <span className="kbd">↵</span> 提出</span>
        </div>
        <div className="right">
          <button className="btn btn-sm" onClick={runSample} disabled={running}>
            <Icon name="play" size={13} /> サンプル実行
          </button>
          <button className="btn btn-sm btn-primary" onClick={submit} disabled={submitting}>
            <Icon name="send" size={13} /> 提出する
          </button>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.kind}`}>
          <Icon name={toast.kind === "ok" ? "check" : "x"} size={16} style={{ color: toast.kind === "ok" ? "var(--ok)" : "var(--err)" }} />
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- LEFT PANES ---------- */
function ProblemStatement({ p }) {
  return (
    <div className="prose">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, letterSpacing: "-0.02em" }}>{p.title}</h2>
          <div className="row" style={{ gap: 8, marginTop: 6 }}>
            <span className={`diff-badge diff-${p.difficulty}`}>中級</span>
            <span className="chip mono-sm">score 200</span>
          </div>
        </div>
        <div className="col" style={{ gap: 4, alignItems: "flex-end" }}>
          <span className="mono-sm muted">Time: {p.limits.time}</span>
          <span className="mono-sm muted">Memory: {p.limits.memory}</span>
        </div>
      </div>
      {p.statement.map((b, i) => {
        if (b.kind === "h2") return <h2 key={i}>{b.text}</h2>;
        if (b.kind === "p") return <p key={i}>{b.text}</p>;
        if (b.kind === "ul") return <ul key={i}>{b.items.map((x, j) => <li key={j}><code>{x}</code></li>)}</ul>;
        if (b.kind === "code") return (
          <pre key={i} style={{ background: "var(--bg-code)", padding: 12, borderRadius: 8, border: "1px solid var(--line-1)", fontSize: 12.5, lineHeight: 1.6 }}>
            <code style={{ background: "transparent", border: 0, padding: 0, color: "var(--text-1)" }}>{b.text}</code>
          </pre>
        );
      })}
      <h2>入出力例</h2>
      {p.samples.map((s, i) => (
        <div key={i} className="sample-block">
          <div className="head">
            <span>Sample #{i + 1}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => navigator.clipboard?.writeText(s.in)}>
              <Icon name="doc" size={11} /> Copy input
            </button>
          </div>
          <div className="io-grid" style={{ padding: 10 }}>
            <div className="box">
              <div className="lbl">Input</div>
              <pre>{s.in}</pre>
            </div>
            <div className="box">
              <div className="lbl">Output</div>
              <pre>{s.out}</pre>
            </div>
          </div>
          {s.note && <div style={{ padding: "0 12px 10px", fontSize: 12, color: "var(--text-3)" }}>💡 {s.note}</div>}
        </div>
      ))}
    </div>
  );
}

function HintsPanel({ hints, revealed, onReveal }) {
  return (
    <div className="prose">
      <h2>ヒント</h2>
      <p className="muted">段階的に開示されます。詰まった時にどうぞ。</p>
      <div className="col" style={{ gap: 10 }}>
        {hints.map((h, i) => (
          <div key={i} className="surface" style={{ padding: 14 }}>
            <div className="row between" style={{ marginBottom: i < revealed ? 8 : 0 }}>
              <span className="mono-sm" style={{ color: "var(--accent)" }}>Hint {h.level}</span>
              {i >= revealed && <button className="btn btn-sm" onClick={onReveal}><Icon name="eye" size={12} /> 見る</button>}
            </div>
            {i < revealed && <div style={{ color: "var(--text-2)" }}>{h.text}</div>}
            {i >= revealed && <div className="muted" style={{ fontStyle: "italic", filter: "blur(4px)", userSelect: "none" }}>{h.text}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsPanel() {
  const langs = [
    { l: "Python", pct: 48 },
    { l: "C++", pct: 28 },
    { l: "JavaScript", pct: 14 },
    { l: "Rust", pct: 7 },
    { l: "Go", pct: 3 },
  ];
  return (
    <div className="prose">
      <h2>統計</h2>
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 24 }}>
        <div className="stat-box"><div className="k">AC率</div><div className="v">52<span style={{ fontSize: 14, color: "var(--text-3)" }}>%</span></div></div>
        <div className="stat-box"><div className="k">総提出</div><div className="v">4,280</div></div>
        <div className="stat-box"><div className="k">平均時間</div><div className="v">18<span style={{ fontSize: 14, color: "var(--text-3)" }}>分</span></div></div>
      </div>
      <h2>言語別提出</h2>
      <div className="col" style={{ gap: 8 }}>
        {langs.map(x => (
          <div key={x.l} className="row" style={{ gap: 12 }}>
            <span className="mono-sm" style={{ width: 90 }}>{x.l}</span>
            <div className="progress" style={{ flex: 1 }}><span style={{ width: `${x.pct}%` }} /></div>
            <span className="mono-sm muted" style={{ width: 40, textAlign: "right" }}>{x.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscussPanel() {
  const threads = [
    { u: "alice", a: "A", when: "2h", text: "累積和、配列の先頭に0を入れておくとL,R入力時のオフセットで悩まなくて済みます。" },
    { u: "sato", a: "S", when: "yesterday", text: "Pythonでinput()が遅いときはsys.stdin.readlineがお約束ですね。" },
    { u: "maria", a: "M", when: "3d", text: "Coming from LeetCode — is the input format 1-indexed here? Just making sure." },
  ];
  return (
    <div className="prose">
      <h2>議論 <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>12件</span></h2>
      <div className="col" style={{ gap: 10 }}>
        {threads.map((t, i) => (
          <div key={i} className="surface" style={{ padding: 14 }}>
            <div className="row" style={{ gap: 10, marginBottom: 8 }}>
              <span className="avatar sm">{t.a}</span>
              <b>{t.u}</b>
              <span className="muted mono-sm">· {t.when}</span>
            </div>
            <div style={{ color: "var(--text-2)" }}>{t.text}</div>
            <div className="row" style={{ gap: 14, marginTop: 10, color: "var(--text-3)" }}>
              <span className="mono-sm"><Icon name="heart" size={11} /> 8</span>
              <span className="mono-sm"><Icon name="chat" size={11} /> 返信</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryPanel() {
  const rows = DATA.SUBMISSIONS.slice(0, 6);
  return (
    <div>
      <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>提出履歴</h2>
      <table className="submission-table">
        <thead><tr><th>#</th><th>Lang</th><th>Result</th><th>Time</th><th>Mem</th><th>When</th></tr></thead>
        <tbody>
          {rows.map(s => (
            <tr key={s.id}>
              <td className="mono-sm">#{s.id}</td>
              <td className="mono-sm">{s.lang}</td>
              <td><VerdictChip v={s.status} /></td>
              <td className="mono-sm">{s.time}</td>
              <td className="mono-sm">{s.mem}</td>
              <td className="mono-sm muted">{s.when}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VerdictChip({ v }) {
  const map = { AC: "ok", WA: "err", TLE: "tle", RE: "re", CE: "ce" };
  return <span className={`status ${map[v] || "ok"}`} style={{
    padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
    background: v === "AC" ? "var(--ok-soft)" : v === "WA" ? "var(--err-soft)" : v === "TLE" ? "var(--warn-soft)" : "var(--re-soft)",
    color: v === "AC" ? "var(--ok)" : v === "WA" ? "var(--err)" : v === "TLE" ? "var(--warn)" : "var(--re)",
  }}>{v}</span>;
}

/* ---------- RESULTS ---------- */
function SampleResults({ running, results, samples, onRun }) {
  if (running) return <div className="muted" style={{ padding: 20, textAlign: "center" }}><span className="pulse">●</span> サンプルを実行中…</div>;
  if (!results) return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <div className="muted" style={{ marginBottom: 10 }}>まだ実行していません</div>
      <button className="btn btn-sm" onClick={onRun}><Icon name="play" size={12} /> サンプルを実行</button>
    </div>
  );
  return (
    <div>
      {results.map((r, i) => (
        <div key={i} style={{ marginBottom: 12, border: "1px solid var(--line-1)", borderRadius: 8, overflow: "hidden", background: "var(--bg-1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid var(--line-1)" }}>
            <div className="row" style={{ gap: 10 }}>
              <b style={{ fontFamily: "var(--font-sans)" }}>Sample #{r.idx}</b>
              <span className={`status ${r.status}`} style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                background: r.status === "ac" ? "var(--ok-soft)" : "var(--err-soft)",
                color: r.status === "ac" ? "var(--ok)" : "var(--err)",
              }}>{r.status.toUpperCase()}</span>
            </div>
            <span className="mono-sm muted">{r.time} · {r.mem}</span>
          </div>
          <div className="io-grid" style={{ padding: 10 }}>
            <div className="box"><div className="lbl">Input</div><pre>{r.input}</pre></div>
            <div className={`box ${r.status === "ac" ? "ok" : "bad"}`}>
              <div className="lbl">{r.status === "ac" ? "Output ✓" : `Output (expected: ${r.expected.split("\n")[0]}…)`}</div>
              <pre>{r.actual}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomRun({ input, setInput, output, onRun }) {
  return (
    <div>
      <div className="row between" style={{ marginBottom: 8 }}>
        <span className="mono-sm muted">自由に入力を試せます</span>
        <button className="btn btn-sm" onClick={onRun}><Icon name="play" size={11} /> 実行</button>
      </div>
      <div className="io-grid">
        <div className="box">
          <div className="lbl">Input</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: "100%", minHeight: 120, background: "transparent", border: 0,
              color: "var(--text-1)", fontFamily: "var(--font-mono)", fontSize: 12, resize: "vertical", outline: "none"
            }}
          />
        </div>
        <div className="box">
          <div className="lbl">Output</div>
          <pre style={{ minHeight: 120, margin: 0 }}>{output || <span className="muted" style={{ fontFamily: "var(--font-sans)" }}>実行するとここに出力されます</span>}</pre>
        </div>
      </div>
    </div>
  );
}

function SubmitResults({ submitting, submission, onSubmit }) {
  if (submitting) return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <div className="muted" style={{ marginBottom: 10 }}><span className="pulse">●</span> 全テストケースを検証中…</div>
      <div className="progress" style={{ maxWidth: 320, margin: "0 auto" }}>
        <span style={{ width: "60%", animation: "pulseDot 1.2s ease-in-out infinite" }} />
      </div>
    </div>
  );
  if (!submission) return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <div className="muted" style={{ marginBottom: 10 }}>まだ提出していません</div>
      <button className="btn btn-sm btn-primary" onClick={onSubmit}><Icon name="send" size={12} /> 提出する</button>
    </div>
  );
  const { cases, passed, total, verdict } = submission;
  return (
    <div>
      <div style={{
        padding: "12px 14px", borderRadius: 8, marginBottom: 12,
        background: verdict === "AC" ? "var(--ok-soft)" : "var(--err-soft)",
        border: `1px solid ${verdict === "AC" ? "oklch(0.82 0.16 145 / 0.4)" : "oklch(0.72 0.19 25 / 0.4)"}`,
      }}>
        <div className="row between">
          <div className="row" style={{ gap: 10 }}>
            <Icon name={verdict === "AC" ? "check" : "x"} size={18} style={{ color: verdict === "AC" ? "var(--ok)" : "var(--err)" }} />
            <b style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: verdict === "AC" ? "var(--ok)" : "var(--err)" }}>
              {verdict === "AC" ? "Accepted — 全ケース通過!" : `Wrong Answer — ${passed}/${total} ケース通過`}
            </b>
          </div>
          <span className="mono-sm muted">#submit 41{Math.floor(Math.random() * 999)}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
        {cases.map(c => (
          <div key={c.idx} className="result-case" style={{
            gridTemplateColumns: "auto 1fr auto", gap: 8, padding: "6px 10px", margin: 0, fontSize: 11,
          }}>
            <span className="mono-sm muted">#{c.idx.toString().padStart(2, "0")}</span>
            <span className="mono-sm" style={{ color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
            <span className={`status ${c.status}`} style={{
              padding: "1px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700,
              background: c.status === "ac" ? "var(--ok-soft)" : c.status === "tle" ? "var(--warn-soft)" : "var(--err-soft)",
              color: c.status === "ac" ? "var(--ok)" : c.status === "tle" ? "var(--warn)" : "var(--err)",
            }}>{c.status.toUpperCase()}</span>
          </div>
        ))}
      </div>
      {verdict !== "AC" && (
        <div className="muted mono-sm" style={{ padding: "8px 2px" }}>
          💡 ヒント: 愚直 O(NQ) は TLE になります。「ヒント」タブを見てみましょう。
        </div>
      )}
    </div>
  );
}

/* ---------- MONACO ---------- */
let monacoReadyPromise = null;
function ensureMonaco() {
  if (monacoReadyPromise) return monacoReadyPromise;
  monacoReadyPromise = new Promise((resolve) => {
    if (window.monaco) return resolve(window.monaco);
    window.require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs" } });
    window.require(["vs/editor/editor.main"], () => {
      // register a dark theme that matches tokens
      window.monaco.editor.defineTheme("codeMakerDark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6b6782", fontStyle: "italic" },
          { token: "keyword", foreground: "c5a3ff" },
          { token: "string", foreground: "a5f3a0" },
          { token: "number", foreground: "ffb86b" },
          { token: "type", foreground: "7cc4ff" },
        ],
        colors: {
          "editor.background": "#1a1820",
          "editor.foreground": "#e8e4f1",
          "editorLineNumber.foreground": "#514d63",
          "editorLineNumber.activeForeground": "#a8a4bc",
          "editor.selectionBackground": "#4a3f6b55",
          "editor.lineHighlightBackground": "#221f2a",
          "editorCursor.foreground": "#c5a3ff",
          "editor.inactiveSelectionBackground": "#3a3248",
          "editorIndentGuide.background": "#2a2635",
          "editorWidget.background": "#221f2a",
        },
      });
      resolve(window.monaco);
    });
  });
  return monacoReadyPromise;
}

function MonacoEditor({ value, language, onChange }) {
  // Standalone mode: Monaco can't be bundled (it streams chunks at runtime).
  // Fall back to a lightly-styled read-only code block that matches the editor look.
  if (window.__STANDALONE__) {
    return <StaticCodeBlock value={value} language={language} />;
  }

  const hostRef = useRef(null);
  const editorRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    ensureMonaco().then((monaco) => {
      if (disposed || !hostRef.current) return;
      const ed = monaco.editor.create(hostRef.current, {
        value,
        language: langMap(language),
        theme: "codeMakerDark",
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: 13.5,
        lineHeight: 22,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        padding: { top: 12, bottom: 12 },
        tabSize: 4,
        wordWrap: "on",
        fixedOverflowWidgets: true,
      });
      ed.onDidChangeModelContent(() => onChange(ed.getValue()));
      editorRef.current = ed;
      setReady(true);

      const ro = new ResizeObserver(() => ed.layout());
      ro.observe(hostRef.current);
      ed._ro = ro;
    });
    return () => {
      disposed = true;
      if (editorRef.current) {
        editorRef.current._ro?.disconnect();
        editorRef.current.dispose();
      }
    };
  }, []);

  // external value/language sync
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    if (ed.getValue() !== value) ed.setValue(value);
  }, [value]);
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed || !window.monaco) return;
    window.monaco.editor.setModelLanguage(ed.getModel(), langMap(language));
  }, [language]);

  return (
    <div className="editor-host">
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
      {!ready && (
        <div style={{
          position: "absolute", inset: 0, display: "grid", placeItems: "center",
          color: "var(--text-4)", fontFamily: "var(--font-mono)", fontSize: 12,
        }}>
          <span className="pulse">● エディタ読み込み中…</span>
        </div>
      )}
    </div>
  );
}

function langMap(l) {
  return { python: "python", javascript: "javascript", cpp: "cpp", rust: "rust" }[l] || "python";
}

/* ---------- Static fallback for standalone builds (no Monaco) ---------- */
function StaticCodeBlock({ value, language }) {
  // Minimal syntax-ish coloring: keywords, strings, comments, numbers.
  const tokenize = React.useCallback((src) => {
    const kw = {
      python: /\b(def|return|if|elif|else|for|while|in|import|from|as|class|lambda|None|True|False|and|or|not|pass|print|int|str|list|dict|input|range|map|len|with|try|except)\b/g,
      javascript: /\b(function|return|if|else|for|while|const|let|var|class|new|import|from|export|default|null|true|false|async|await|of|in|typeof)\b/g,
      cpp: /\b(int|long|short|char|bool|void|return|if|else|for|while|class|struct|public|private|const|auto|using|namespace|std|include|template|typename|true|false|vector|string|cin|cout|endl)\b/g,
      rust: /\b(fn|let|mut|pub|struct|enum|impl|trait|use|mod|if|else|for|while|loop|match|return|Some|None|Ok|Err|true|false|as|in|ref|self|Self)\b/g,
    }[language] || /$.^/;
    const lines = src.split("\n");
    return lines.map((line, i) => {
      // Escape then mark token spans via placeholder strategy
      let html = line
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      // strings
      html = html.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g,
        '<span class="tok-str">$1</span>');
      // comments (# for py, // for others)
      if (language === "python") {
        html = html.replace(/(#.*)$/, '<span class="tok-com">$1</span>');
      } else {
        html = html.replace(/(\/\/.*)$/, '<span class="tok-com">$1</span>');
      }
      // keywords
      html = html.replace(kw, '<span class="tok-kw">$1</span>');
      // numbers
      html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
      return { n: i + 1, html };
    });
  }, [language]);

  const lines = tokenize(value || "");

  return (
    <div className="static-code-host" style={{
      position: "absolute", inset: 0,
      background: "oklch(0.16 0.008 280)",
      overflow: "auto",
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 13.5,
      lineHeight: "22px",
    }}>
      <style>{`
        .static-code-host .tok-kw  { color: oklch(0.78 0.15 305); }
        .static-code-host .tok-str { color: oklch(0.80 0.13 135); }
        .static-code-host .tok-com { color: oklch(0.55 0.02 280); font-style: italic; }
        .static-code-host .tok-num { color: oklch(0.80 0.14 75); }
        .static-code-host pre { margin: 0; padding: 12px 0; }
        .static-code-host .line {
          display: grid;
          grid-template-columns: 48px 1fr;
          padding: 0;
          color: oklch(0.86 0.01 280);
        }
        .static-code-host .ln {
          color: oklch(0.48 0.01 280);
          text-align: right;
          padding-right: 14px;
          user-select: none;
        }
        .static-code-host .code { white-space: pre; padding-right: 16px; }
      `}</style>
      <pre>
        {lines.map(({ n, html }) => (
          <div className="line" key={n}>
            <span className="ln">{n}</span>
            <span className="code" dangerouslySetInnerHTML={{ __html: html || " " }} />
          </div>
        ))}
      </pre>
    </div>
  );
}

window.PageProblem = PageProblem;
