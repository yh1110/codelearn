// My page (/me) + public profile (/u/[username])

function PageMe() {
  const { go } = useRouter();
  const [tab, setTab] = React.useState("progress");
  const u = DATA.CURRENT_USER;

  return (
    <div className="page route-enter" data-screen-label="06 Me">
      <div className="row" style={{ gap: 16, marginBottom: 24 }}>
        <div className="avatar xl">{u.avatar}</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: "-0.02em" }}>{u.name}</h1>
          <div className="muted mono-sm">@{u.handle} · 参加 {u.joined}</div>
          <div style={{ color: "var(--text-2)", marginTop: 6 }}>{u.bio}</div>
        </div>
        <button className="btn"><Icon name="edit" size={13} /> 編集</button>
        <button className="btn"><Icon name="settings" size={13} /> 設定</button>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="k">AC 済み</div><div className="v">{u.acCount}</div><div className="delta">+12 今週</div></div>
        <div className="stat-box"><div className="k">連続日数</div><div className="v">{u.streak}<span style={{ fontSize: 14, color: "var(--text-3)" }}>日</span></div></div>
        <div className="stat-box"><div className="k">作成した問題集</div><div className="v">{u.createdCount}</div></div>
        <div className="stat-box"><div className="k">獲得 Stars</div><div className="v">{u.likes.toLocaleString()}</div></div>
      </div>

      <div className="me-tabs">
        {[
          { v: "progress", l: "進捗" },
          { v: "favs", l: "お気に入り" },
          { v: "creations", l: "作成" },
          { v: "submissions", l: "提出履歴" },
        ].map(t => (
          <button key={t.v} aria-selected={tab === t.v} onClick={() => setTab(t.v)}>{t.l}</button>
        ))}
      </div>

      {tab === "progress" && (
        <div>
          <div className="sec-head"><div><h2>提出ヒートマップ</h2><span className="sub">過去52週</span></div></div>
          <div className="heatmap-wrap">
            <div className="heatmap">
              {DATA.HEATMAP.map((v, i) => (
                <div key={i} className={`heat-cell ${v ? `heat-${v}` : ""}`} />
              ))}
            </div>
            <div className="heatmap-foot">
              <span>過去1年で <b style={{ color: "var(--text-1)" }}>{DATA.HEATMAP.filter(v => v > 0).length}</b> 日活動しました</span>
              <div className="heatmap-legend">
                少ない
                <div className="heat-cell" />
                <div className="heat-cell heat-1" />
                <div className="heat-cell heat-2" />
                <div className="heat-cell heat-3" />
                <div className="heat-cell heat-4" />
                多い
              </div>
            </div>
          </div>

          <div className="sec-head" style={{ marginTop: 32 }}><div><h2>挑戦中のCollection</h2></div></div>
          <div className="grid-3">
            {DATA.COLLECTIONS.filter(c => c.progress.done > 0 && c.progress.done < c.progress.total).slice(0, 3).map(c => (
              <div key={c.id} className="tutorial-card" onClick={() => go(ROUTES.COLLECTION, { slug: c.slug })}>
                <div className="head">
                  <div>
                    <h4>{c.title}</h4>
                    <div className="desc">{c.author.name} · {c.problemCount}問</div>
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
        </div>
      )}

      {tab === "favs" && (
        <div className="grid-3">
          {DATA.COLLECTIONS.slice(0, 6).map(c => <ColCard key={c.id} c={c} grid />)}
        </div>
      )}

      {tab === "creations" && (
        <div className="create-grid">
          {DATA.MY_CREATIONS.map(c => (
            <div key={c.id} className="create-card" onClick={() => go(ROUTES.CREATE_EDIT, { id: c.id })}>
              <div className={`img-placeholder ${c.cover}`} style={{ height: 60, fontSize: 0 }} />
              <div className="row between">
                <h3 style={{ flex: 1 }}>{c.title}</h3>
                <span className={`status-pill ${c.status}`}>{c.status === "draft" ? "下書き" : "公開中"}</span>
              </div>
              <div className="meta">{c.problems} 問 · {c.lastEdited}</div>
              <div className="stats-mini">
                <span>挑戦 <b>{c.attempts}</b></span>
                <span>AC率 <b>{c.acRate ?? "—"}{c.acRate ? "%" : ""}</b></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "submissions" && (
        <div>
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="muted">全 {DATA.SUBMISSIONS.length} 件</div>
            <div className="segment">
              <button aria-pressed="true">すべて</button>
              <button aria-pressed="false">AC</button>
              <button aria-pressed="false">WA</button>
              <button aria-pressed="false">TLE</button>
            </div>
          </div>
          <table className="submission-table">
            <thead>
              <tr><th>#</th><th>問題</th><th>Collection</th><th>言語</th><th>結果</th><th>時間</th><th>メモリ</th><th>提出日時</th></tr>
            </thead>
            <tbody>
              {DATA.SUBMISSIONS.map(s => (
                <tr key={s.id}>
                  <td className="mono-sm muted">#{s.id}</td>
                  <td><a style={{ color: "var(--text-1)", cursor: "pointer" }} onClick={() => go(ROUTES.PROBLEM)}>{s.problem}</a></td>
                  <td className="muted">{s.collection}</td>
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
      )}
    </div>
  );
}

function PageProfile() {
  const { go } = useRouter();
  const u = { name: "alice", handle: "alice", avatar: "A",
    bio: "競プロ歴3年 / DP大好き / codeMaker で古典問題を公開しています。",
    joined: "2024-08", acCount: 482, createdCount: 5, likes: 3240, streak: 62 };

  return (
    <div className="page route-enter" data-screen-label="07 Profile">
      <div className="profile-hero">
        <div className="banner" />
        <div className="avatar xl" style={{ background: "linear-gradient(135deg, oklch(0.72 0.16 30), oklch(0.68 0.14 320))" }}>{u.avatar}</div>
        <div>
          <h1>{u.name}</h1>
          <div className="handle">@{u.handle}</div>
          <div className="meta-row">
            <span><Icon name="clock" size={11} /> {u.joined}〜</span>
            <span><Icon name="fire" size={11} /> {u.streak}日連続</span>
            <span><Icon name="globe" size={11} /> Tokyo, JP</span>
          </div>
          <p className="bio">{u.bio}</p>
        </div>
        <div className="col" style={{ alignItems: "flex-end", gap: 8 }}>
          <button className="btn btn-primary"><Icon name="plus" size={13} /> フォロー</button>
          <button className="btn btn-ghost btn-sm"><Icon name="share" size={12} /> 共有</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box"><div className="k">AC 済み</div><div className="v">{u.acCount}</div></div>
        <div className="stat-box"><div className="k">作成Collection</div><div className="v">{u.createdCount}</div></div>
        <div className="stat-box"><div className="k">獲得 Stars</div><div className="v">{u.likes.toLocaleString()}</div></div>
        <div className="stat-box"><div className="k">フォロワー</div><div className="v">128</div></div>
      </div>

      <div className="profile-grid">
        <div>
          <div className="sec-head"><div><h2>作成したCollection</h2></div></div>
          <div style={{ display: "grid", gap: 12 }}>
            {DATA.COLLECTIONS.filter(c => ["alice", "official"].includes(c.author.handle)).map(c => (
              <div key={c.id}
                onClick={() => go(ROUTES.COLLECTION, { slug: c.slug })}
                style={{
                  display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 16, alignItems: "center",
                  padding: 14, background: "var(--bg-1)", border: "1px solid var(--line-1)",
                  borderRadius: "var(--r-lg)", cursor: "pointer",
                }}
              >
                <div className={`img-placeholder ${c.cover}`} style={{ height: 60, fontSize: 0, borderRadius: 8 }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    <span className={`diff-badge diff-${c.difficulty}`} style={{ marginRight: 6 }}>{["", "初級", "中級", "上級"][c.difficulty]}</span>
                    {c.problemCount}問 · ★ {c.stars} · AC {c.acRate}%
                  </div>
                </div>
                <Icon name="chevRight" size={16} className="muted" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="sec-head"><div><h2>活動</h2></div></div>
          <div className="heatmap-wrap" style={{ marginBottom: 20 }}>
            <div className="heatmap">
              {DATA.HEATMAP.map((v, i) => <div key={i} className={`heat-cell ${v ? `heat-${v}` : ""}`} />)}
            </div>
          </div>
          <div className="surface" style={{ padding: 18 }}>
            <div className="label" style={{ marginBottom: 12 }}>Recent activity</div>
            <div className="col" style={{ gap: 12 }}>
              {[
                { i: "check", t: "新作: 区間DP練習4問 を公開", w: "2日前", c: "var(--ok)" },
                { i: "star", t: "「Binary Search Bootcamp」が100 Stars突破", w: "1週間前", c: "var(--accent)" },
                { i: "trophy", t: "100日連続AC 達成", w: "2週間前", c: "var(--warn)" },
                { i: "plus", t: "DP古典10選 にProblem追加", w: "3週間前", c: "var(--text-3)" },
              ].map((a, i) => (
                <div key={i} className="row" style={{ gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--bg-2)", display: "grid", placeItems: "center", color: a.c }}>
                    <Icon name={a.i} size={12} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13 }}>{a.t}</span>
                  <span className="mono-sm muted">{a.w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PageMe = PageMe;
window.PageProfile = PageProfile;
