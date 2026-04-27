// Explore page — community Collection list

function PageExplore({ officialOnly }) {
  const { go } = useRouter();
  const [difficulty, setDifficulty] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const [sort, setSort] = React.useState("popular");
  const [view, setView] = React.useState("grid");
  const [langs, setLangs] = React.useState([]);

  const all = officialOnly
    ? DATA.COLLECTIONS.filter(c => c.official)
    : DATA.COLLECTIONS;

  const filtered = React.useMemo(() => {
    let r = all.slice();
    if (difficulty.length) r = r.filter(c => difficulty.includes(c.difficulty));
    if (tags.length) r = r.filter(c => c.tags.some(t => tags.includes(t)));
    if (sort === "new") r.sort((a, b) => b.attempts - a.attempts);
    if (sort === "popular") r.sort((a, b) => b.stars - a.stars);
    if (sort === "ac") r.sort((a, b) => b.acRate - a.acRate);
    if (sort === "untouched") r.sort((a, b) => (a.progress.done) - (b.progress.done));
    return r;
  }, [all, difficulty, tags, sort]);

  const toggle = (arr, setArr, v) =>
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const label = officialOnly ? "02b 公式" : "02 Explore";
  const heading = officialOnly ? "公式チュートリアル" : "Explore — コミュニティの問題集";
  const sub = officialOnly ? "codeMaker チーム公式の学習コース" : "他のユーザーが作ったCollectionを探そう";

  return (
    <div className="page route-enter" data-screen-label={label}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, letterSpacing: "-0.02em" }}>{heading}</h1>
        <div className="muted" style={{ fontSize: 13 }}>{sub}</div>
      </div>

      <div className="explore-layout">
        <aside className="filter-panel">
          <div className="group">
            <h4>難易度</h4>
            {[
              { v: 1, label: "初級", count: all.filter(c => c.difficulty === 1).length },
              { v: 2, label: "中級", count: all.filter(c => c.difficulty === 2).length },
              { v: 3, label: "上級", count: all.filter(c => c.difficulty === 3).length },
            ].map(d => (
              <label key={d.v} className="check-row">
                <span><input type="checkbox" checked={difficulty.includes(d.v)} onChange={() => toggle(difficulty, setDifficulty, d.v)} />
                  <span className={`diff-badge diff-${d.v}`} style={{ marginLeft: 4 }}>{d.label}</span>
                </span>
                <span className="count">{d.count}</span>
              </label>
            ))}
          </div>
          <div className="group">
            <h4>タグ</h4>
            <div className="tags">
              {DATA.ALL_TAGS.map(t => (
                <div
                  key={t}
                  className={`tag ${tags.includes(t) ? "active" : ""}`}
                  onClick={() => toggle(tags, setTags, t)}
                >{t}</div>
              ))}
            </div>
          </div>
          <div className="group">
            <h4>対応言語</h4>
            {["Python", "JavaScript", "C++", "Rust", "Go"].map(l => (
              <label key={l} className="check-row">
                <span><input type="checkbox" checked={langs.includes(l)} onChange={() => toggle(langs, setLangs, l)} /> <span className="mono-sm">{l}</span></span>
              </label>
            ))}
          </div>
          {(difficulty.length || tags.length || langs.length) ? (
            <button className="btn btn-sm btn-ghost" style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setDifficulty([]); setTags([]); setLangs([]); }}>
              <Icon name="x" size={12} /> フィルタをクリア
            </button>
          ) : null}
        </aside>

        <div className="explore-main">
          <div className="toolbar">
            <div className="result-count"><b>{filtered.length}</b> / {all.length} 件</div>
            <div className="row" style={{ gap: 10 }}>
              <div className="segment" role="tablist">
                {[
                  { v: "popular", l: "人気" },
                  { v: "new", l: "新着" },
                  { v: "ac", l: "AC率高" },
                  { v: "untouched", l: "未挑戦" },
                ].map(s => (
                  <button key={s.v} aria-pressed={sort === s.v} onClick={() => setSort(s.v)}>{s.l}</button>
                ))}
              </div>
              <div className="segment">
                <button aria-pressed={view === "grid"} onClick={() => setView("grid")} aria-label="Grid"><Icon name="grid" size={13} /></button>
                <button aria-pressed={view === "list"} onClick={() => setView("list")} aria-label="List"><Icon name="list" size={13} /></button>
              </div>
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid-3">
              {filtered.map(c => <ColCard key={c.id} c={c} grid />)}
            </div>
          ) : (
            <div className="surface" style={{ overflow: "hidden" }}>
              {filtered.map((c, i) => (
                <div key={c.id}
                  onClick={() => go(ROUTES.COLLECTION, { slug: c.slug })}
                  style={{
                    display: "grid", gridTemplateColumns: "48px 1fr auto auto auto", gap: 16,
                    padding: "14px 18px", alignItems: "center",
                    borderBottom: i === filtered.length - 1 ? 0 : "1px solid var(--line-1)",
                    cursor: "pointer",
                  }}
                >
                  <div className={`img-placeholder ${c.cover}`} style={{ height: 40, width: 48, fontSize: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div className="muted mono-sm" style={{ marginTop: 2 }}>{c.author.name} · {c.tags.slice(0, 3).join(", ")}</div>
                  </div>
                  <span className={`diff-badge diff-${c.difficulty}`}>{["", "初級", "中級", "上級"][c.difficulty]}</span>
                  <span className="mono-sm muted">{c.problemCount}問</span>
                  <span className="mono-sm"><Icon name="star" size={11} /> {c.stars}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.PageExplore = PageExplore;
