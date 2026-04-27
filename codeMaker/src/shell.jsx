// Shell = topbar + route container + tiny router via useState

const ROUTES = {
  HOME: "home",
  EXPLORE: "explore",
  OFFICIAL: "official",
  COLLECTION: "collection",
  PROBLEM: "problem",
  CREATE: "create",
  CREATE_EDIT: "create_edit",
  ME: "me",
  PROFILE: "profile",
};

// Router store — holds { route, params }
const RouterContext = React.createContext(null);

function useRouter() { return React.useContext(RouterContext); }

function RouterProvider({ children }) {
  const [state, setState] = React.useState({ route: ROUTES.HOME, params: {} });
  const go = React.useCallback((route, params = {}) => {
    setState({ route, params });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return (
    <RouterContext.Provider value={{ ...state, go }}>
      {children}
    </RouterContext.Provider>
  );
}

function TopBar() {
  const { route, go } = useRouter();
  const isFullBleed = route === ROUTES.PROBLEM || route === ROUTES.CREATE_EDIT;
  if (isFullBleed) return <ProblemTopBar />;

  const navGroup = (() => {
    if ([ROUTES.HOME, ROUTES.ME, ROUTES.PROFILE].includes(route)) return "home";
    if ([ROUTES.EXPLORE, ROUTES.OFFICIAL, ROUTES.COLLECTION].includes(route)) return "explore";
    if ([ROUTES.CREATE].includes(route)) return "create";
    return null;
  })();

  return (
    <header className="topbar">
      <div className="brand" onClick={() => go(ROUTES.HOME)} style={{ cursor: "pointer" }}>
        <div className="brand-mark">{`</>`}</div>
        <span>codeMaker</span>
        <small>beta</small>
      </div>

      <div className="search">
        <span className="search-icon"><Icon name="search" size={14} /></span>
        <input className="input" placeholder="Collection / Problem を検索…" />
        <span className="kbd-hint"><span className="kbd">⌘</span> <span className="kbd">K</span></span>
      </div>

      <div className="topbar-right">
        <nav className="nav-tabs" aria-label="Primary">
          <button aria-current={navGroup === "explore" ? "page" : undefined} onClick={() => go(ROUTES.EXPLORE)}>
            <Icon name="compass" size={14} /> 探す
          </button>
          <button aria-current={false} onClick={() => go(ROUTES.OFFICIAL)}>
            <Icon name="book" size={14} /> 学ぶ
          </button>
          <button aria-current={navGroup === "create" ? "page" : undefined} onClick={() => go(ROUTES.CREATE)}>
            <Icon name="plus" size={14} /> 作る
          </button>
        </nav>
        <button className="icon-btn" aria-label="Notifications">
          <Icon name="bell" size={18} />
          <span className="badge-dot" />
        </button>
        <button className="avatar" aria-label="Profile" onClick={() => go(ROUTES.ME)}>
          {DATA.CURRENT_USER.avatar}
        </button>
      </div>
    </header>
  );
}

// Topbar for full-bleed screens (Problem / edit) — more compact
function ProblemTopBar() {
  const { route, params, go } = useRouter();
  const p = DATA.CURRENT_PROBLEM;

  return (
    <header className="problem-topbar" data-screen-label={route === ROUTES.PROBLEM ? "04 Problem" : "05b Problem Edit"}>
      <div className="left">
        <button className="btn btn-ghost btn-sm" onClick={() => go(ROUTES.COLLECTION, { slug: p.collection.slug })}>
          <Icon name="arrowLeft" size={14} /> Collection
        </button>
        <div className="crumb">
          <span onClick={() => go(ROUTES.COLLECTION, { slug: p.collection.slug })} style={{ cursor: "pointer" }}>
            {p.collection.title}
          </span>
          <Icon name="chevRight" size={12} />
          <b>Problem {p.num}</b>
        </div>
      </div>
      <div className="title-box">
        <h1>{p.title}</h1>
        <div className="sub">#{p.slug} · <span className={`diff-badge diff-${p.difficulty}`} style={{ verticalAlign: "middle" }}>中級</span></div>
      </div>
      <div className="right">
        <span className="chip"><Icon name="clock" size={12} /> {p.limits.time}</span>
        <span className="chip"><Icon name="chart" size={12} /> {p.limits.memory}</span>
        <button className="icon-btn" aria-label="Bookmark"><Icon name="bookmark" size={16} /></button>
        <button className="avatar" aria-label="Profile" onClick={() => go(ROUTES.ME)}>
          {DATA.CURRENT_USER.avatar}
        </button>
      </div>
    </header>
  );
}

window.ROUTES = ROUTES;
window.RouterContext = RouterContext;
window.RouterProvider = RouterProvider;
window.useRouter = useRouter;
window.TopBar = TopBar;
