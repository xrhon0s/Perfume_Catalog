import { Component, Fragment, type ReactNode } from "react"

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
  retryKey: number
}

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    retryKey: 0,
  }

  static getDerivedStateFromError(): Partial<AppErrorBoundaryState> {
    return { hasError: true }
  }

  private retry = () => {
    this.setState((state) => ({
      hasError: false,
      retryKey: state.retryKey + 1,
    }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
          <section className="max-w-md text-center">
            <p className="text-sm font-semibold uppercase text-white/45">
              Algo salió mal
            </p>
            <h1 className="mt-3 text-3xl font-semibold">
              No pudimos mostrar esta pantalla
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Puedes intentarlo nuevamente. Tus datos no se modificaron.
            </p>
            <button
              className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-white/90"
              type="button"
              onClick={this.retry}
            >
              Reintentar
            </button>
          </section>
        </main>
      )
    }

    return <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>
  }
}
