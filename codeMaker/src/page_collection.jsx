// Collection detail page

function PageCollection() {
  const { params, go } = useRouter();
  const slug = params.slug || "getting-started";
  const c = DATA.COLLECTIONS.find(x => x.slug === slug) || DATA.COLLECTIONS[0];
  const problems = DATA.PROBLEMS; // demo: always show this set

  const isAuthor = false; // toggle for author view

  return (
    <div className="page route-enter" data-screen-label="03 Collection">
      <div className="col-hero">
        <div className={`hero-bg ${c.cover}`} />
        <div className="hero-body">
          <div className="row" style={{ gap: 8 }}>
            <span className={`diff-badge diff-${c.difficulty}`}>{["", "初級", "中級", "上級"][c.difficulty]}</span>
            {c.official && <span className="chip chip-accent"><Icon name="check" size={11} /> 公式</span>}
            <span className="chip">{c.problemCount} 問</span>
          </div>
          <h1>{c.title}</h1>
          <div className="row" style={{ gap: 8, color: "var(--text-3)" }}>
            <span className="avatar sm" style={{ width: 22, height: 22, fontSize: 10 }}>{c.author.avatar}</span>
            <span>{c.author.name}</span>
            <span>·</span>
            <a style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => go(ROUTES.PROFILE, { handle: c.author.handle })}>
              プロフィールを見る
            </a>
          </div>
          <p className="desc">{c.desc}</p>
          <div className="hero-tags">
            {c.tags.map(t => <span key={t} className="chip">#{t}</span>)}
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary"
              onClick={() => go(ROUTES.PROBLEM, { slug: problems[0].slug })}>
              <Icon name="play" size={14} /> 最初から始める
            </button>
            <button className="btn"><Icon name="star" size={14} /> お気に入り <span className="mono-sm muted">{c.stars}</span></button>
            <button className="btn btn-ghost"><Icon name="share" size={14} /> シェア</button>
            <button className="btn btn-ghost"><Icon name="bookmark" size={14} /> 後で</button>
          </div>
        </div>

        <div className="progress-strip">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span className="label">あなたの進捗</span>
              <span className="mono-sm">{c.progress.done}/{c.progress.total} AC</span>
            </div>
            <div className="progress"><span style={{ width: `${(c.progress.done / c.progress.total) * 100}%` }} /></div>
          </div>
          <div className="stats">
            <div className="stat"><div className="v">{c.attempts.toLocaleString()}</div><div className="k">総挑戦者</div></div>
            <div className="stat"><div className="v">{c.acRate}<span style={{ fontSize: 14, color: "var(--text-3)" }}>%</span></div><div className="k">完走率</div></div>
            <div className="stat"><div className="v">{c.stars}</div><div className="k">Stars</div></div>
          </div>
        </div>
      </div>

      <div className="sec-head">
        <div>
          <h2>Problems</h2>
          <span className="sub">順番に取り組むのがおすすめ</span>
        </div>
        <div className="row">
          {isAuthor && (<>
            <button className="btn btn-sm"><Icon name="chart" size={13} /> 統計</button>
            <button className="btn btn-sm"><Icon name="edit" size={13} /> 編集</button>
          </>)}
          <button className="btn btn-sm btn-ghost"><Icon name="filter" size={13} /> フィルタ</button>
        </div>
      </div>

      <div className="prob-list">
        <div className="prob-head">
          <span>#</span>
          <span></span>
          <span>Title</span>
          <span>Difficulty</span>
          <span>AC Rate</span>
          <span>Solve time</span>
        </div>
        {problems.map(p => (
          <div key={p.id} className="prob-row" onClick={() => go(ROUTES.PROBLEM, { slug: p.slug })}>
            <span className="num">{p.num.toString().padStart(2, "0")}</span>
            <span
              className={`status-dot status-${p.status === "none" ? "none" : p.status}`}
              title={p.status === "ac" ? "AC" : p.status === "wa" ? "WA" : p.status === "try" ? "挑戦中" : "未着手"}
            />
            <div className="title">
              {p.title}
              <div className="sub">{p.subtitle}</div>
            </div>
            <span><span className={`diff-badge diff-${p.difficulty}`}>{["", "初級", "中級", "上級"][p.difficulty]}</span></span>
            <span className="acc">
              <span>{p.acRate}%</span>
              <div className="mini-bar"><span style={{ width: `${p.acRate}%` }} /></div>
            </span>
            <span className="mono-sm muted">{p.solveTime ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.PageCollection = PageCollection;
