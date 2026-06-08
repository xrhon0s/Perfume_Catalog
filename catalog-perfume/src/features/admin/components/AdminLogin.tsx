import type { FormEvent } from "react"

type AdminLoginProps = {
  email: string
  password: string
  error: string | null
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export default function AdminLogin({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-sm">
        <a className="text-sm text-white/60 hover:text-white" href="#">
          ← Volver al catálogo
        </a>
        <h1 className="mt-8 text-3xl font-semibold">Ingreso admin</h1>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm">
            Email
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-white/40"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Contraseña
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-white/40"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-white/90">
            Entrar
          </button>
        </form>
      </div>
    </main>
  )
}

