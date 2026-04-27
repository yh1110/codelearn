// App root + Tweaks wiring

function App() {
  const { route } = useRouter();

  let content;
  switch (route) {
    case ROUTES.EXPLORE:   content = <PageExplore />; break;
    case ROUTES.OFFICIAL:  content = <PageExplore officialOnly />; break;
    case ROUTES.COLLECTION: content = <PageCollection />; break;
    case ROUTES.PROBLEM:   content = <PageProblem />; break;
    case ROUTES.CREATE:    content = <PageCreate />; break;
    case ROUTES.CREATE_EDIT: content = <PageCreateEdit />; break;
    case ROUTES.ME:        content = <PageMe />; break;
    case ROUTES.PROFILE:   content = <PageProfile />; break;
    default:               content = <PageHome />;
  }

  return (
    <div className="app">
      <TopBar />
      {content}
      <TweaksPanel title="Tweaks">
        <AccentTweak />
      </TweaksPanel>
    </div>
  );
}

function AccentTweak() {
  const defaults = window.__TWEAKS || { accentHue: 295 };
  const [vals, setTweak] = useTweaks(defaults);

  // Apply hue to CSS var
  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent-h", String(vals.accentHue));
  }, [vals.accentHue]);

  const presets = [
    { name: "Violet", h: 295 },
    { name: "Indigo", h: 265 },
    { name: "Azure",  h: 235 },
    { name: "Teal",   h: 185 },
    { name: "Lime",   h: 135 },
    { name: "Amber",  h: 75 },
    { name: "Coral",  h: 25 },
    { name: "Rose",   h: 355 },
  ];

  return (
    <>
      <TweakSection label="アクセントカラー" />
      <div style={{ fontSize: 10.5, color: "#6b6757", marginBottom: 8, padding: "0 12px" }}>
        プリセット or 色相スライダーで調整
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, margin: "0 12px 12px" }}>
        {presets.map(p => (
          <button key={p.h}
            onClick={() => setTweak("accentHue", p.h)}
            style={{
              padding: "7px 2px",
              borderRadius: 8,
              background: vals.accentHue === p.h ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.4)",
              border: `1px solid ${vals.accentHue === p.h ? `oklch(0.68 0.18 ${p.h})` : "rgba(0,0,0,0.08)"}`,
              color: "#29261b",
              fontSize: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            <span style={{
              width: 16, height: 16, borderRadius: 999,
              background: `oklch(0.68 0.18 ${p.h})`,
            }} />
            {p.name}
          </button>
        ))}
      </div>
      <TweakSlider label="Hue" value={vals.accentHue} min={0} max={360} step={1}
        onChange={(v) => setTweak("accentHue", v)} />
    </>
  );
}

// Initial accent apply from defaults before React mounts
document.documentElement.style.setProperty("--accent-h", String((window.__TWEAKS || {}).accentHue || 295));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <RouterProvider>
    <App />
  </RouterProvider>
);
