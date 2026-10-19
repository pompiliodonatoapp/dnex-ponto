import { Component, lazy, Suspense, useEffect } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
  ShowcaseHeader,
  ShowcaseOverview,
  ShowcaseFooter,
} from "./ShowcaseExperience";
import { navGroups } from "./navigation";

const Catalog = lazy(() => import("./Catalog"));

class CatalogBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "Não foi possível carregar o catálogo DNEX",
      error,
      info.componentStack,
    );
  }
  render() {
    return this.state.failed ? (
      <div className="ds-catalog-loading" role="alert">
        <h2>A biblioteca não carregou.</h2>
        <p>
          Verifique a conexão e tente novamente. A prévia acima continua
          disponível.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}

function CatalogReady() {
  useEffect(() => {
    if (!window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  }, []);
  return null;
}

export function App() {
  return (
    <div className="min-h-screen ds-showcase">
      <ShowcaseHeader groups={navGroups} />
      <main className="container-dnex">
        <ShowcaseOverview />
        <CatalogBoundary>
          <Suspense
            fallback={
              <div className="ds-catalog-loading" role="status">
                <span className="ds-live-dot" /> Preparando a biblioteca de
                componentes…
              </div>
            }
          >
            <Catalog />
            <CatalogReady />
          </Suspense>
        </CatalogBoundary>
      </main>
      <ShowcaseFooter />
    </div>
  );
}
