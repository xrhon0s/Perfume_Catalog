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
    <AdminAccessLayout
      eyebrow="Acceso restringido"
      title="Esta cuenta no tiene permiso"
      description={`La sesión${email ? ` de ${email}` : ""} está activa, pero no pertenece al grupo de administración.`}
      wide
    >
      <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
        <p>Agrega el UID de este usuario a la tabla de administradores.</p>
      </div>
      <div className="mt-4 rounded-md border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <span className="min-w-0 truncate font-mono text-xs text-slate-500">
            {userId}
          </span>
          <button
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            type="button"
            title="Copiar SQL"
            aria-label="Copiar SQL"
            onClick={() => void navigator.clipboard.writeText(sql)}
          >
            <Copy aria-hidden="true" size={16} />
          </button>
        </div>
        <pre className="overflow-x-auto p-4 text-xs leading-6 text-slate-700">
          {sql}
        </pre>
      </div>
      <div className="mt-5 flex justify-end">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onLogout}
        >
          <LogOut aria-hidden="true" size={17} />
          Cerrar sesión
        </button>
      </div>
    </AdminAccessLayout>
  )
}
import { Copy, LogOut, ShieldAlert } from "lucide-react"
import AdminAccessLayout from "./AdminAccessLayout"
