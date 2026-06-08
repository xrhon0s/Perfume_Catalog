import type { Perfume } from "../../../data/types"

type PerfumeTableProps = {
  perfumes: Perfume[]
  isLoading: boolean
  status: string | null
  error: string | null
  search: string
  deletingId: string | null
  onSearchChange: (value: string) => void
  onEdit: (perfume: Perfume) => void
  onDelete: (id: string) => void
}

export default function PerfumeTable({
  perfumes,
  isLoading,
  status,
  error,
  search,
  deletingId,
  onSearchChange,
  onEdit,
  onDelete,
}: PerfumeTableProps) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Perfumes</h2>
          <p className="text-sm text-slate-500">
            {isLoading ? "Cargando..." : `${perfumes.length} resultados`}
          </p>
        </div>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-400 sm:w-72"
          placeholder="Buscar..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {(error || status) && (
        <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
          {error ?? status}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="min-w-52 px-3 py-3">Perfume</th>
              <th className="min-w-36 px-3 py-3">Marca</th>
              <th className="min-w-32 px-3 py-3">Familia</th>
              <th className="min-w-36 px-3 py-3">Perfil</th>
              <th className="min-w-44 px-3 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {perfumes.map((perfume) => (
              <tr key={perfume.id}>
                <td className="px-3 py-3 font-medium">{perfume.name}</td>
                <td className="px-3 py-3 text-slate-600">{perfume.brand}</td>
                <td className="px-3 py-3 text-slate-600">
                  {perfume.family ?? "Sin familia"}
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {[perfume.concentration, perfume.gender, perfume.year]
                    .filter(Boolean)
                    .join(" · ") || "Sin perfil"}
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded-lg border px-3 py-1.5 font-medium hover:bg-slate-50"
                      onClick={() => onEdit(perfume)}
                    >
                      Editar
                    </button>
                    <button
                      className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50"
                      disabled={deletingId === perfume.id}
                      onClick={() => onDelete(perfume.id)}
                    >
                      {deletingId === perfume.id ? "..." : "Desactivar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && perfumes.length === 0 && (
              <tr>
                <td className="px-3 py-8 text-center text-slate-500" colSpan={5}>
                  No hay perfumes que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

