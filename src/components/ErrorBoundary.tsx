import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-cream">
          <p className="font-display text-3xl tracking-tight text-[var(--color-mark-cal)]">Hierro</p>
          <h1 className="mt-2 font-display text-4xl">Esta pantalla no cargó</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Recarga la página. Si sigue igual, vuelve al calendario y entra de nuevo a la sección.
          </p>
          <button
            type="button"
            className="mt-6 h-11 rounded-full bg-accent px-4 text-sm font-semibold text-ink"
            onClick={() => window.location.assign("/")}
          >
            Volver al calendario
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
