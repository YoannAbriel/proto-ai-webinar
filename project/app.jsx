/* global React, ReactDOM, NavCtx, Shell,
   CatalogueScreen, DetailScreen, DeployScreen, EndpointScreen, GridScreen, EdgeScreen */
const { useState: useStateA, useEffect: useEffectA, useCallback: useCallbackA } = React;

const SCREENS = {
  catalogue: CatalogueScreen,
  detail:    DetailScreen,
  deploy:    DeployScreen,
  endpoint:  EndpointScreen,
  grid:      GridScreen,
  edge:      EdgeScreen,
  monitor:   MonitoringScreen,
};

const SCREEN_LABELS = {
  catalogue: "01 Catalogue",
  detail:    "02 Model detail",
  deploy:    "03 Configuration",
  endpoint:  "04 Live endpoint",
  grid:      "05 AI Grid",
  edge:      "06 Edge Performance",
  monitor:   "07 Monitoring",
};

const App = () => {
  // Read initial screen from URL hash for shareable deep-links
  const initial = (window.location.hash || "").replace("#/", "").replace("#", "");
  const [screen, setScreen] = useStateA(SCREENS[initial] ? initial : "catalogue");
  // Currently-selected model — drives Detail / Deploy / Endpoint so they're no
  // longer hardcoded to Mistral.
  const [modelId, setModelId] = useStateA("mistral-small-24b");

  const go = useCallbackA((next) => {
    if (!SCREENS[next]) return;
    setScreen(next);
    window.history.replaceState(null, "", `#/${next}`);
  }, []);

  // Always land at the top on every screen change (runs after the new screen
  // renders, so it is reliable even when the next screen is taller).
  useEffectA(() => {
    document.querySelector(".main")?.scrollTo({ top: 0 });
  }, [screen]);

  // Pick a model and jump to a screen in one call (defaults to the detail page).
  const openModel = useCallbackA((id, next = "detail") => {
    if (id) setModelId(id);
    go(next);
  }, [go]);

  // Hotkeys: ←/→ to navigate, 1-6 for direct jump (silent, no UI)
  useEffectA(() => {
    const order = ["catalogue", "detail", "deploy", "endpoint", "grid", "edge", "monitor"];
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const i = order.indexOf(screen);
      if (e.key === "ArrowRight" && i < order.length - 1) go(order[i + 1]);
      if (e.key === "ArrowLeft" && i > 0) go(order[i - 1]);
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 7) go(order[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, go]);

  const Current = SCREENS[screen] || CatalogueScreen;

  return (
    <NavCtx.Provider value={{ screen, go, modelId, setModelId, openModel }}>
      <div data-screen-label={SCREEN_LABELS[screen]}>
        <Shell>
          <Current />
        </Shell>
      </div>
    </NavCtx.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
