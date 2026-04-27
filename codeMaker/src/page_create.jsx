// Create dashboard + Problem edit

function PageCreate() {
  const { go } = useRouter();
  const [tab, setTab] = React.useState("all");
  const filtered = DATA.MY_CREATIONS.filter(c => tab === "all" ? true : c.status === tab);

  return (
    <div className="page route-enter" data-screen-label="05 Create">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, letterSpacing: "-0.02em" }}>あなたのCollection</h1>
          <div className="muted" style={{ fontSize: 13 }}>問題を作って、誰かの学びになる</div>
        </div>
        <button className="btn btn-primary">
          <Icon name="plus" size={14} /> 新しいCollection
        </button>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 20, marginBottom: 24 }}>
        <div className="stat-box"><div className="k">公開中</div><div className="v">2</div></div>
        <div className="stat-box"><div className="k">下書き</div><div className="v">1</div></div>
        <div className="stat-box"><div className="k">総挑戦者</div><div className="v">1,616</div><div className="delta">+48 今週</div></div>
        <div className="stat-box"><div className="k">平均AC率</div><div className="v">46<span style={{ fontSize: 14, color: "var(--text-3)" }}>%</span></div></div>
      </div>

      <div className="me-tabs" style={{ marginBottom: 20 }}>
        <button aria-selected={tab === "all"} onClick={() => setTab("all")}>すべて ({DATA.MY_CREATIONS.length})</button>
        <button aria-selected={tab === "pub"} onClick={() => setTab("pub")}>公開中 ({DATA.MY_CREATIONS.filter(c => c.status === "pub").length})</button>
        <button aria-selected={tab === "draft"} onClick={() => setTab("draft")}>下書き ({DATA.MY_CREATIONS.filter(c => c.status === "draft").length})</button>
      </div>

      <div className="create-grid">
        {filtered.map(c => (
          <div key={c.id} className="create-card" onClick={() => go(ROUTES.CREATE_EDIT, { id: c.id })}>
            <div className={`img-placeholder ${c.cover}`} style={{ height: 60, fontSize: 0 }} />
            <div className="row between">
              <h3 style={{ flex: 1 }}>{c.title}</h3>
              <span className={`status-pill ${c.status}`}>{c.status === "draft" ? "下書き" : "公開中"}</span>
            </div>
            <div className="meta">{c.problems} 問 · 最終編集 {c.lastEdited}</div>
            <div className="stats-mini">
              <span>挑戦 <b>{c.attempts}</b></span>
              <span>AC率 <b>{c.acRate ?? "—"}{c.acRate ? "%" : ""}</b></span>
            </div>
          </div>
        ))}
        <div className="create-card add">
          <Icon name="plus" size={28} />
          <div>新しいCollection</div>
          <div className="muted" style={{ fontSize: 12 }}>ゼロから作る、またはテンプレートから</div>
        </div>
      </div>

      <div className="sec-head" style={{ marginTop: 40 }}>
        <div>
          <h2>テンプレートから始める</h2>
          <span className="sub">よくあるパターンのひな形</span>
        </div>
      </div>
      <div className="create-grid">
        {[
          { t: "DP問題集", desc: "漸化式の解説つきテンプレート", icon: "grid" },
          { t: "グラフ探索", desc: "DFS/BFSの雛形・ヴィジュアライザ付き", icon: "compass" },
          { t: "数学バトル", desc: "整数論テンプレート", icon: "sparkles" },
        ].map((tpl, i) => (
          <div key={i} className="create-card" style={{ minHeight: 140 }}>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}>
                <Icon name={tpl.icon} size={18} />
              </div>
              <h3 style={{ flex: 1 }}>{tpl.t}</h3>
            </div>
            <div className="meta" style={{ marginTop: "auto" }}>{tpl.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageCreateEdit() {
  const { go } = useRouter();
  const [sections, setSections] = React.useState({
    basic: true, statement: true, io: true, samples: true, cases: false, limits: false, langs: false, starter: false, solution: false,
  });
  const toggle = (k) => setSections(s => ({ ...s, [k]: !s[k] }));

  const [title, setTitle] = React.useState("木DPの基礎 — 部分木のサイズ");
  const [slug, setSlug] = React.useState("tree-dp-subtree-size");
  const [statement, setStatement] = React.useState("N頂点の根付き木が与えられます。根 1 とする時、各頂点 v について、v を根とする部分木に含まれる頂点数を求めてください。\n\nDFSで後帰り順に数える典型問題です。");
  const [sampleIn, setSampleIn] = React.useState("5\n1 2\n1 3\n2 4\n2 5");
  const [sampleOut, setSampleOut] = React.useState("5 3 1 1 1");
  const [cases, setCases] = React.useState([
    { id: 1, name: "sample_1", sample: true, size: "0.1 KB" },
    { id: 2, name: "small_1", sample: false, size: "0.3 KB" },
    { id: 3, name: "medium_1", sample: false, size: "4.2 KB" },
    { id: 4, name: "large_1", sample: false, size: "98.1 KB" },
  ]);
  const [autoTestResult, setAutoTestResult] = React.useState(null);
  const [autoTesting, setAutoTesting] = React.useState(false);
  const runAuto = () => {
    setAutoTesting(true);
    setAutoTestResult(null);
    setTimeout(() => {
      setAutoTesting(false);
      setAutoTestResult({ pass: cases.length, total: cases.length });
    }, 1400);
  };

  return (
    <div className="edit-split" data-screen-label="05b Problem Edit">
      <div className="edit-form">
        <div className="row between" style={{ marginBottom: 20 }}>
          <div>
            <div className="mono-sm muted">Collection: 木DP 超入門</div>
            <h1 style={{ margin: "4px 0 0", fontSize: 20, letterSpacing: "-0.01em" }}>Problem 4 を編集</h1>
          </div>
          <div className="row">
            <button className="btn btn-sm btn-ghost" onClick={() => go(ROUTES.CREATE)}><Icon name="arrowLeft" size={12} /> ダッシュボード</button>
            <button className="btn btn-sm"><Icon name="eye" size={12} /> 公開プレビュー</button>
            <button className="btn btn-sm btn-primary"><Icon name="check" size={12} /> 保存</button>
          </div>
        </div>

        <Section open={sections.basic} toggle={() => toggle("basic")} title="基本情報">
          <div className="field">
            <label>タイトル</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="two-col">
            <div className="field">
              <label>スラッグ</label>
              <input className="input mono" value={slug} onChange={e => setSlug(e.target.value)} />
              <div className="hint">URL: /problems/{slug}</div>
            </div>
            <div className="field">
              <label>難易度</label>
              <div className="row" style={{ gap: 6 }}>
                {[1, 2, 3].map(d => (
                  <span key={d} className={`diff-badge diff-${d}`} style={{ cursor: "pointer", opacity: d === 2 ? 1 : 0.45, padding: "4px 12px" }}>
                    {["", "初級", "中級", "上級"][d]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section open={sections.statement} toggle={() => toggle("statement")} title="問題文 (Markdown + LaTeX)">
          <div className="field">
            <div className="row between" style={{ marginBottom: 6 }}>
              <label style={{ margin: 0 }}>本文</label>
              <div className="row" style={{ gap: 4 }}>
                <span className="kbd">B</span>
                <span className="kbd">I</span>
                <span className="kbd">∑</span>
                <span className="kbd">‹/›</span>
              </div>
            </div>
            <textarea className="textarea" value={statement} onChange={e => setStatement(e.target.value)} style={{ minHeight: 160 }} />
            <div className="hint">$...$ でLaTeX、``` でコードブロック</div>
          </div>
        </Section>

        <Section open={sections.io} toggle={() => toggle("io")} title="入出力形式 & 制約">
          <div className="two-col">
            <div className="field"><label>入力形式</label><textarea className="textarea" defaultValue={"N\nu_1 v_1\nu_2 v_2\n:\nu_{N-1} v_{N-1}"} /></div>
            <div className="field"><label>出力形式</label><textarea className="textarea" defaultValue="各頂点 v (v = 1..N) に対する答えを空白区切りで1行に" /></div>
          </div>
          <div className="field">
            <label>制約</label>
            <textarea className="textarea" defaultValue={"1 ≤ N ≤ 10^5\n1 ≤ u_i, v_i ≤ N"} style={{ minHeight: 60 }} />
          </div>
        </Section>

        <Section open={sections.samples} toggle={() => toggle("samples")} title="サンプル入出力">
          <div className="case-row">
            <span className="mono-sm" style={{ width: 50 }}>Sample 1</span>
            <div>
              <div className="mini-label">Input</div>
              <textarea className="textarea" value={sampleIn} onChange={e => setSampleIn(e.target.value)} style={{ minHeight: 80, marginBottom: 0 }} />
            </div>
            <div>
              <div className="mini-label">Output</div>
              <textarea className="textarea" value={sampleOut} onChange={e => setSampleOut(e.target.value)} style={{ minHeight: 80, marginBottom: 0 }} />
            </div>
            <button className="btn btn-sm btn-ghost" aria-label="削除"><Icon name="trash" size={13} /></button>
          </div>
          <button className="btn btn-sm btn-ghost"><Icon name="plus" size={12} /> サンプルを追加</button>
        </Section>

        <Section open={sections.cases} toggle={() => toggle("cases")} title={`テストケース (${cases.length}件)`}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <div className="mono-sm muted">CSV/TXTでまとめてアップロード or 手動追加</div>
            <div className="row">
              <button className="btn btn-sm"><Icon name="upload" size={12} /> CSVアップロード</button>
              <button className="btn btn-sm btn-primary" onClick={runAuto} disabled={autoTesting}>
                <Icon name="play" size={12} /> {autoTesting ? "検証中…" : "想定解で自動テスト"}
              </button>
            </div>
          </div>
          {autoTestResult && (
            <div style={{ padding: "8px 12px", borderRadius: 8, background: "var(--ok-soft)", border: "1px solid oklch(0.82 0.16 145 / 0.4)", marginBottom: 10, color: "var(--ok)", fontSize: 12 }}>
              <Icon name="check" size={12} /> 想定解で {autoTestResult.pass}/{autoTestResult.total} ケース通過 — 公開OK
            </div>
          )}
          {cases.map(c => (
            <div key={c.id} className="case-row" style={{ gridTemplateColumns: "auto 1fr auto auto auto" }}>
              <span className="mono-sm muted">#{c.id.toString().padStart(2, "0")}</span>
              <span className="mono-sm">{c.name}</span>
              <span className={`toggle-chip ${c.sample ? "on" : ""}`}
                onClick={() => setCases(cs => cs.map(x => x.id === c.id ? { ...x, sample: !x.sample } : x))}>
                {c.sample ? "公開" : "隠し"}
              </span>
              <span className="mono-sm muted">{c.size}</span>
              <button className="btn btn-sm btn-ghost"><Icon name="trash" size={12} /></button>
            </div>
          ))}
          <button className="btn btn-sm btn-ghost"><Icon name="plus" size={12} /> ケースを追加</button>
        </Section>

        <Section open={sections.limits} toggle={() => toggle("limits")} title="実行制限">
          <div className="two-col">
            <div className="field"><label>実行時間</label><input className="input mono" defaultValue="2 sec" /></div>
            <div className="field"><label>メモリ</label><input className="input mono" defaultValue="256 MB" /></div>
          </div>
        </Section>

        <Section open={sections.langs} toggle={() => toggle("langs")} title="許可言語">
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {["Python", "JavaScript", "C++", "Rust", "Go", "Java", "Kotlin", "Ruby"].map((l, i) => (
              <span key={l} className={`toggle-chip ${i < 5 ? "on" : ""}`}>{l}</span>
            ))}
          </div>
        </Section>

        <Section open={sections.starter} toggle={() => toggle("starter")} title="スターターコード">
          <div className="muted mono-sm">言語ごとの雛形を設定。未設定なら言語デフォルト。</div>
        </Section>

        <Section open={sections.solution} toggle={() => toggle("solution")} title="想定解 (作者のみ閲覧可)">
          <div className="muted mono-sm">自動テストに使う正答コード</div>
        </Section>

        <div style={{ height: 60 }} />
      </div>

      <div className="edit-preview">
        <div className="preview-bar">
          <div className="row" style={{ gap: 10 }}>
            <Icon name="eye" size={14} style={{ color: "var(--accent)" }} />
            <b>ライブプレビュー</b>
            <span className="chip mono-sm">学習者が見る画面</span>
          </div>
          <div className="mono-sm muted"><span className="pulse" style={{ color: "var(--ok)" }}>●</span> 自動保存済み · 2秒前</div>
        </div>
        <div style={{ padding: "28px 32px" }}>
          <div className="prose" style={{ maxWidth: 640 }}>
            <div className="row" style={{ gap: 8, marginBottom: 6 }}>
              <span className="diff-badge diff-2">中級</span>
              <span className="mono-sm muted">#{slug}</span>
            </div>
            <h2 style={{ margin: "0 0 16px", fontSize: 22, letterSpacing: "-0.02em" }}>{title}</h2>
            {statement.split("\n\n").map((par, i) => <p key={i}>{par}</p>)}
            <h2>入出力例</h2>
            <div className="sample-block">
              <div className="head">
                <span>Sample #1</span>
                <span>1-indexed</span>
              </div>
              <div className="io-grid" style={{ padding: 10 }}>
                <div className="box"><div className="lbl">Input</div><pre>{sampleIn}</pre></div>
                <div className="box"><div className="lbl">Output</div><pre>{sampleOut}</pre></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ open, toggle, title, children }) {
  return (
    <div className={`form-section ${open ? "" : "collapsed"}`}>
      <button onClick={toggle}>
        <span>{title}</span>
        <span className="chev"><Icon name="chevDown" size={14} /></span>
      </button>
      <div className="body">{children}</div>
    </div>
  );
}

window.PageCreate = PageCreate;
window.PageCreateEdit = PageCreateEdit;
