import { useMemo, useState } from "react"
import type { Perfume } from "../../../data/types"

type StatusFilter = "active" | "inactive" | "all"

type PerfumeTableProps = {
  perfumes: Perfume[]
  isLoading: boolean
  status: string | null
  error: string | null
  search: string
  statusFilter: StatusFilter
  deletingId: string | null
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: StatusFilter) => void
  onEdit: (perfume: Perfume) => void
  onDelete: (id: string) => void
}

const PAGE_SIZE = 12

export default function PerfumeTable({
  perfumes,
  isLoading,
  status,
  error,
  search,
  statusFilter,
  deletingId,
  onSearchChange,
  onStatusFilterChange,
  onEdit,
  onDelete,
}: PerfumeTableProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(perfumes.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visiblePerfumes = useMemo(
    () => perfumes.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [safePage, perfumes],
  )
  const firstResult = perfumes.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const lastResult = Math.min(safePage * PAGE_SIZE, perfumes.length)

  return (
    <section className="min-w-0 rounded-lg bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Perfumes</h2>
          <p className="text-sm text-slate-500">
            {isLoading ? "Cargando..." : `${perfumes.length} resultados`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={statusFilter}
            onChange={(event) => {
              setPage(1)
              onStatusFilterChange(event.target.value as StatusFilter)
            }}
          >
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="all">Todos</option>
          </select>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-400 sm:w-72"
            placeholder="Buscar..."
            value={search}
            onChange={(event) => {
              setPage(1)
              onSearchChange(event.target.value)
            }}
          />
        </div>
      </div>

      {(error || status) && (
        <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
          {error ?? status}
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="w-[28%] px-3 py-3">Perfume</th>
              <th className="w-[15%] px-3 py-3">Marca</th>
              <th className="w-[13%] px-3 py-3">Familia</th>
              <th className="w-[16%] px-3 py-3">Perfil</th>
              <th className="w-[10%] px-3 py-3">Estado</th>
              <th className="w-[18%] px-3 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {visiblePerfumes.map((perfume) => {
              const isActive = perfume.isActive !== false

              return (
                <tr key={perfume.id}>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-slate-100">
                        {perfume.image ? (
                          <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={perfume.image}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase text-slate-400">
                            Sin img
                          </div>
                        )}
                      </div>
                      <span className="min-w-0 truncate font-medium">
                        {perfume.name}
                      </span>
                    </div>
                  </td>
                  <td className="truncate px-3 py-3 text-slate-600">
                    {perfume.brand}
                  </td>
                  <td className="truncate px-3 py-3 text-slate-600">
                    {perfume.family ?? "Sin familia"}
                  </td>
                  <td className="truncate px-3 py-3 text-slate-600">
                    {[perfume.concentration, perfume.gender, perfume.year]
                      .filter(Boolean)
                      .join(" · ") || "Sin perfil"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        className="rounded-lg border px-2 py-1.5 text-xs font-medium hover:bg-slate-50"
                        onClick={() => onEdit(perfume)}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={deletingId === perfume.id || !isActive}
                        onClick={() => onDelete(perfume.id)}
                      >
                        {deletingId === perfume.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!isLoading && perfumes.length === 0 && (
              <tr>
                <td className="px-3 py-8 text-center text-slate-500" colSpan={6}>
                  No hay perfumes que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {perfumes.length === 0
            ? "Sin resultados"
            : `${firstResult}-${lastResult} de ${perfumes.length}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </button>
          <span className="min-w-20 text-center font-medium">
            {safePage} / {totalPages}
          </span>
          <button
            className="rounded-lg border px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={safePage === totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  )
}
