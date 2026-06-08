type AdminHeaderProps = {
  onLogout: () => void
}

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <a className="text-sm text-slate-500 hover:text-slate-900" href="#">
            ← Catálogo
          </a>
          <h1 className="mt-1 text-2xl font-semibold">Administración</h1>
        </div>
        <button
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          onClick={onLogout}
        >
          Salir
        </button>
      </div>
    </header>
  )
}

