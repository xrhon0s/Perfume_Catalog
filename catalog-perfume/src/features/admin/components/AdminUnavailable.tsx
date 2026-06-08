export default function AdminUnavailable() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <a className="text-sm text-white/60 hover:text-white" href="#">
          ← Volver al catálogo
        </a>
        <h1 className="mt-8 text-3xl font-semibold">Administración</h1>
        <p className="mt-4 text-white/70">
          Para activar el CRUD necesitas configurar Supabase en `.env.local`
          usando las variables de `.env.example`.
        </p>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
          <p>Variables requeridas:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-black/30 p-3">
            VITE_SUPABASE_URL{"\n"}VITE_SUPABASE_ANON_KEY
          </pre>
        </div>
      </div>
    </main>
  )
}

