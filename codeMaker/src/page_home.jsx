// Home page — personalized feed

function PageHome() {
  const { go } = useRouter();
  const continueProblem = DATA.CURRENT_PROBLEM;
  const officialCols = DATA.COLLECTIONS.filter(c => c.official);
  const communityCols = DATA.COLLECTIONS.filter(c => !c.official);

  return (
    <div className="page route-enter" data-screen-label="01 Home">
      {/* Continue */}
      <div className="home-hero grain">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="label" style={{ marginBottom: 4 }}>続きから</div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>
              おかえりなさい、{DATA.CURRENT_USER.name.split(" ")[0]}さん
            </h2>
          </div>
          <div className="row" style={{ gap: 14 }}>
            <div className="chip"><Icon name="fire" size={12} style={{ color: "var(--warn)" }} /> {DATA.CURRENT_USER.streak}日連続</div>
            <div className="chip chip-accent"><Icon name="check" size={12} /> {DATA.CURRENT_USER.acCount} AC</div>
          </div>
        </div>

        <div className="continue-card">
          <div className="cover">
            <span className="mono">{continueProblem.collection.title.slice(0, 16)}</span>
          </div>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 6 }}>
              <span className="chip">Problem {continueProblem.num}/10</span>
              <span className="diff-badge diff-2">中級</span>
              <span className="chip" style={{ color: "var(--warn)" }}>
                <span className="pulse" style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor", display: "inline-block" }} />
                挑戦中
              </span>
            </div>
            <h3>{continueProblem.title}</h3>
            <div className="meta">{continueProblem.collection.title}</div>
            <div className="continue-meta-row">
              <div className="stat">前回の提出: <b>2分前</b></div>
              <div className="stat">結果: <b style={{ color: "var(--warn)" }}>TLE</b></div>
              <div className="stat">ヒント: <b>3段階あり</b></div>
            </div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => go(ROUTES.PROBLEM, { slug: continueProblem.slug })}>
            <Icon name="play" size={14} /> 続ける
          </button>
        </div>
      </div>

      {/* Today */}
      <section style={{ marginTop: 28 }}>
        <div className="sec-head">
          <div>
            <h2>今日のおすすめ</h2>
            <span className="sub">あなたのレベルに合う5問</span>
          </div>
          <a className="more" onClick={() => go(ROUTES.EXPLORE)}>もっと見る <Icon name="arrowRight" size={12} /></a>
        </div>
        <div className="today-grid">
          {[
            { id: "r1", num: 1, title: "最小の両替", diff: 1, rate: 72, tag: "貪欲" },
            { id: "r2", num: 2, title: "Palindrome Check", diff: 1, rate: 85, tag: "文字列" },
            { id: "r3", num: 3, title: "K番目に大きい値", diff: 2, rate: 48, tag: "ヒープ" },
            { id: "r4", num: 4, title: "しりとりグラフ", diff: 2, rate: 42, tag: "グラフ" },
            { id: "r5", num: 5, title: "Subset Sum Redux", diff: 3, rate: 24, tag: "DP" },
          ].map(p => (
            <div key={p.id} className="today-card" onClick={() => go(ROUTES.PROBLEM)}>
              <div className="num">#rec-{p.num.toString().padStart(2, "0")}</div>
              <h4>{p.title}</h4>
              <div className="chip" style={{ alignSelf: "flex-start" }}>{p.tag}</div>
              <div className="foot">
                <span className={`diff-badge diff-${p.diff}`}>{["", "初級", "中級", "上級"][p.diff]}</span>
                <span className="mono-sm muted">{p.rate}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="home-grid">
        {/* Official tutorials */}
        <section>
          <div className="sec-head">
            <div>
              <h2>公式チュートリアル</h2>
              <span className="sub">進捗が残っているコース</span>
            </div>
            <a className="more" onClick={() => go(ROUTES.OFFICIAL)}>一覧 <Icon name="arrowRight" size={12} /></a>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {officialCols.map(c => (
              <div key={c.id} className="tutorial-card" onClick={() => go(ROUTES.COLLECTION, { slug: c.slug })}>
                <div className="head">
                  <div>
                    <h4>{c.title}</h4>
                    <div className="desc">{c.desc.slice(0, 60)}…</div>
                  </div>
                  <span className={`diff-badge diff-${c.difficulty}`}>{["", "初級", "中級", "上級"][c.difficulty]}</span>
                </div>
                <div className="prog-row">
                  <div className="progress"><span style={{ width: `${(c.progress.done / c.progress.total) * 100}%` }} /></div>
                  <span className="mono-sm">{c.progress.done}/{c.progress.total}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* My creations */}
        <section>
          <div className="sec-head">
            <div>
              <h2>あなたの作った問題</h2>
              <span className="sub">作者としての進捗</span>
            </div>
            <a className="more" onClick={() => go(ROUTES.CREATE)}>管理 <Icon name="arrowRight" size={12} /></a>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {DATA.MY_CREATIONS.slice(0, 2).map(c => (
              <div key={c.id} className="tutorial-card" onClick={() => go(ROUTES.CREATE_EDIT, { id: c.id })}>
                <div className="head">
                  <div>
                    <h4>{c.title}</h4>
                    <div className="desc">{c.problems}問 · 最終編集 {c.lastEdited}</div>
                  </div>
                  <span className={`status-pill ${c.status === "draft" ? "draft" : "pub"}`} style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", background: c.status === "draft" ? "var(--warn-soft)" : "var(--ok-soft)", color: c.status === "draft" ? "var(--warn)" : "var(--ok)" }}>
                    {c.status === "draft" ? "下書き" : "公開中"}
                  </span>
                </div>
                {c.status === "pub" && (
                  <div className="prog-row" style={{ color: "var(--text-3)" }}>
                    <span><Icon name="user" size={11} /> <b style={{ color: "var(--text-1)" }}>{c.attempts}</b> 挑戦</span>
                    <span style={{ marginLeft: 16 }}><Icon name="check" size={11} /> AC率 <b style={{ color: "var(--text-1)" }}>{c.acRate}%</b></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Community */}
      <section style={{ marginTop: 40 }}>
        <div className="sec-head">
          <div>
            <h2>コミュニティの新着</h2>
            <span className="sub">他のユーザーが作った問題集</span>
          </div>
          <a className="more" onClick={() => go(ROUTES.EXPLORE)}>すべて <Icon name="arrowRight" size={12} /></a>
        </div>
        <div className="community-row">
          {communityCols.map(c => <ColCard key={c.id} c={c} />)}
        </div>
      </section>
    </div>
  );
}

function ColCard({ c, grid }) {
  const { go } = useRouter();
  return (
    <div className={`col-card ${grid ? "grid-card" : ""}`} onClick={() => go(ROUTES.COLLECTION, { slug: c.slug })}>
      <div className={`cover ${c.cover}`}>
        <div className="cover-glyph">{c.glyph}</div>
        <div className="badges">
          <span className={`diff-badge diff-${c.difficulty}`}>{["", "初級", "中級", "上級"][c.difficulty]}</span>
          {c.official && <span className="chip chip-accent" style={{ padding: "2px 8px", fontSize: 11 }}><Icon name="check" size={10} /> 公式</span>}
        </div>
      </div>
      <div className="body">
        <h3>{c.title}</h3>
        <div className="author">
          <span className="avatar sm" style={{ width: 18, height: 18, fontSize: 9 }}>{c.author.avatar}</span>
          <span>{c.author.name}</span>
        </div>
        <div className="stats">
          <span><Icon name="doc" size={11} /> <b>{c.problemCount}</b></span>
          <span><Icon name="star" size={11} /> <b>{c.stars}</b></span>
          <span><Icon name="check" size={11} /> <b>{c.acRate}%</b></span>
        </div>
      </div>
    </div>
  );
}

window.PageHome = PageHome;
window.ColCard = ColCard;
