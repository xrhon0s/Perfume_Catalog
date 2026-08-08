import { Database } from "lucide-react"
import AdminAccessLayout from "./AdminAccessLayout"

export default function AdminUnavailable() {
  return (
    <AdminAccessLayout
      eyebrow="Configuración"
      title="Supabase no está disponible"
      description="El panel necesita la conexión del proyecto para consultar y guardar perfumes."
      wide
    >
      <div className="flex gap-3 rounded-md border border-slate-200 bg-white p-4">
        <Database aria-hidden="true" className="shrink-0 text-[#8f334d]" size={20} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            Variables requeridas en .env.local
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-200">
            VITE_SUPABASE_URL{"\n"}VITE_SUPABASE_ANON_KEY
          </pre>
        </div>
      </div>
    </AdminAccessLayout>
  )
}
