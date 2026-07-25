import { BookOpen, LogOut } from "lucide-react"
import logo from "../../../assets/eter_wordmark_white.webp"

type AdminHeaderProps = {
  email?: string
  onLogout: () => void
}

export default function AdminHeader({ email, onLogout }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#151713] text-white">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <img alt="Éter" className="h-auto w-20 shrink-0" src={logo} />
          <span aria-hidden="true" className="h-6 w-px bg-white/15" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Administración</p>
            <p className="hidden truncate text-xs text-white/45 sm:block">
              {email ?? "Gestión del catálogo"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-white/65 transition hover:bg-white/5 hover:text-white"
            href="#/"
          >
            <BookOpen aria-hidden="true" size={17} />
            <span className="hidden sm:inline">Ver catálogo</span>
          </a>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/10" />
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-white/65 transition hover:bg-white/5 hover:text-white"
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            <LogOut aria-hidden="true" size={17} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}
