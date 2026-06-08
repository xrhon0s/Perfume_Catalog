type AdminForbiddenProps = {
  email?: string
  userId: string
  onLogout: () => void
}

export default function AdminForbidden({
  email,
  userId,
  onLogout,
}: AdminForbiddenProps) {
  const sql = `insert into public.admin_users (user_id)\nvalues ('${userId}')\non conflict (user_id) do nothing;`

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-xl">
        <a className="text-sm text-white/60 hover:text-white" href="#">
          ← Volver al catálogo
        </a>
        <h1 className="mt-8 text-3xl font-semibold">Sin permiso admin</h1>
        <p className="mt-4 leading-6 text-white/70">
          Iniciaste sesión{email ? ` como ${email}` : ""}, pero este usuario no
          está autorizado para crear, editar o eliminar perfumes.
        </p>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
          <p>Agrega este usuario como admin en Supabase:</p>
          <p className="mt-3 break-all text-xs text-white/55">
            UID: {userId}
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-black/30 p-3">
            {sql}
          </pre>
        </div>
        <button
          className="mt-6 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-white/90"
          onClick={onLogout}
        >
          Salir
        </button>
      </div>
    </main>
  )
}
