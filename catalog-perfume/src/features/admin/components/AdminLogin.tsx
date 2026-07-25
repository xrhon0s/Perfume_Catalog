import type { FormEvent } from "react"
import { AlertCircle, LoaderCircle, LockKeyhole, LogIn, Mail } from "lucide-react"
import AdminAccessLayout from "./AdminAccessLayout"

type AdminLoginProps = {
  email: string
  password: string
  error: string | null
  submitting: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export default function AdminLogin({
  email,
  password,
  error,
  submitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginProps) {
  return (
    <AdminAccessLayout
      eyebrow="Administración"
      title="Inicia sesión"
      description="Accede con la cuenta autorizada para gestionar el catálogo."
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Correo electrónico
          <span className="relative mt-2 block">
            <Mail
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              autoComplete="email"
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#8f334d] focus:ring-2 focus:ring-[#8f334d]/15"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              required
            />
          </span>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Contraseña
          <span className="relative mt-2 block">
            <LockKeyhole
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              autoComplete="current-password"
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition focus:border-[#8f334d] focus:ring-2 focus:ring-[#8f334d]/15"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
            />
          </span>
        </label>
        {error ? (
          <div
            className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
            role="alert"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        ) : null}
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1b1d19] px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
          ) : (
            <LogIn aria-hidden="true" size={18} />
          )}
          {submitting ? "Ingresando..." : "Entrar al panel"}
        </button>
      </form>
    </AdminAccessLayout>
  )
}
