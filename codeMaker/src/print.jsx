// Print-only app: renders every route in a stacked, paged layout

const {
  ROUTES, RouterContext, TopBar,
  PageHome, PageExplore, PageCollection, PageProblem,
  PageCreate, PageCreateEdit, PageMe, PageProfile,
} = window;

// Router that always returns a fixed route + params (no state change)
function FixedRouter({ route, params, children }) {
  const value = React.useMemo(() => ({
    route,
    params: params || {},
    go: () => {}, // no navigation in print
  }), [route, params]);
  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}

// Per-page renderer — mounts shell + the page for a given route
function PrintPage({ label, route, params, children }) {
  return (
    <div className="print-page" data-print-label={label}>
      <span className="print-label">{label}</span>
      <FixedRouter route={route} params={params}>
        <div className="app">
          <TopBar />
          {children}
        </div>
      </FixedRouter>
    </div>
  );
}

function PrintApp() {
  // Apply initial accent
  React.useEffect(() => {
    const hue = (window.__TWEAKS || {}).accentHue ?? 265;
    document.documentElement.style.setProperty("--accent-h", String(hue));
  }, []);

  // Pages to render, in order
  const pages = [
    { label: "01 — Home",               route: ROUTES.HOME,        render: () => <PageHome /> },
    { label: "02 — Explore",            route: ROUTES.EXPLORE,     render: () => <PageExplore /> },
    { label: "02b — Official (Learn)",  route: ROUTES.OFFICIAL,    render: () => <PageExplore officialOnly /> },
    { label: "03 — Collection detail",  route: ROUTES.COLLECTION,  render: () => <PageCollection /> },
    { label: "04 — Problem (solve)",    route: ROUTES.PROBLEM,     render: () => <PageProblem /> },
    { label: "05 — Create dashboard",   route: ROUTES.CREATE,      render: () => <PageCreate /> },
    { label: "05b — Problem editor",    route: ROUTES.CREATE_EDIT, render: () => <PageCreateEdit /> },
    { label: "06 — My page",            route: ROUTES.ME,          render: () => <PageMe /> },
    { label: "07 — Public profile",     route: ROUTES.PROFILE,     render: () => <PageProfile /> },
  ];

  return (
    <>
      {pages.map((p) => (
        <PrintPage key={p.label} label={p.label} route={p.route} params={{}}>
          {p.render()}
        </PrintPage>
      ))}
    </>
  );
}

// Mount
const printRoot = ReactDOM.createRoot(document.getElementById("print-root"));
printRoot.render(<PrintApp />);

// ---- Wait for readiness, then remove the loading splash & auto-print ----
async function waitUntilReady() {
  // 1. Fonts
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) {}
  }
  // 2. Monaco — the Problem page kicks off ensureMonaco() on mount.
  //    Wait until either window.monaco is defined OR a reasonable timeout.
  const monacoDeadline = Date.now() + 8000;
  while (!window.monaco && Date.now() < monacoDeadline) {
    await new Promise(r => setTimeout(r, 150));
  }
  // Give Monaco a moment to finish layout after creation
  if (window.monaco) await new Promise(r => setTimeout(r, 600));
  // 3. Safety buffer for any last paints / async setState
  await new Promise(r => setTimeout(r, 500));
}

waitUntilReady().then(() => {
  const loader = document.getElementById("print-loading");
  if (loader) loader.remove();
  // Force all Monaco editors to re-layout at their container size
  if (window.monaco && window.monaco.editor) {
    try {
      window.monaco.editor.getEditors().forEach(ed => ed.layout());
    } catch (e) {}
  }
  // Auto-trigger print after a moment so the user lands on the dialog
  setTimeout(() => {
    try { window.print(); } catch (e) {}
  }, 600);
});
