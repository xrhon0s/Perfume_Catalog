import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import logo from "../../../assets/eter_wordmark_white.webp"

type AdminAccessLayoutProps = {
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  wide?: boolean
}

export default function AdminAccessLayout({
  eyebrow,
  title,
  description,
  children,
  wide = false,
}: AdminAccessLayoutProps) {
  return (
    <main className="min-h-dvh bg-[#151713] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <img alt="Éter" className="h-auto w-24" src={logo} />
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-white/65 transition hover:bg-white/5 hover:text-white"
            href="#/"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            <span className="hidden sm:inline">Volver al catálogo</span>
            <span className="sm:hidden">Catálogo</span>
          </a>
        </div>
      </header>

      <section className="grid min-h-[calc(100dvh-4rem)] place-items-center px-5 py-10 sm:px-8">
        <div className={wide ? "w-full max-w-2xl" : "w-full max-w-md"}>
          <div className="rounded-lg border border-black/10 bg-[#f7f7f3] p-6 text-[#1b1d19] shadow-2xl shadow-black/30 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f334d]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </section>
    </main>
  )
}
