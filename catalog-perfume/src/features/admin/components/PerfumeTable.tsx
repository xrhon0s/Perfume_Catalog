import { useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  LoaderCircle,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react"
import type { Perfume } from "../../../data/types"
import {
  formatCatalogPrice,
  formatPerfumeSize,
} from "../../../shared/utils/catalogFormatting"

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
  onClearFilters: () => void
  onEdit: (perfume: Perfume) => void
  onDelete: (id: string) => void
}

const PAGE_SIZE = 12
const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "Activos", value: "active" },
  { label: "Ocultos", value: "inactive" },
  { label: "Todos", value: "all" },
]

function PerfumeImage({ perfume }: { perfume: Perfume }) {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
      {perfume.image ? (
        <img
          alt=""
          className="h-full w-full object-contain"
          loading="lazy"
          src={perfume.image}
        />
      ) : (
        <ImageOff aria-hidden="true" className="text-slate-300" size={17} />
      )}
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 text-xs font-medium",
        active ? "text-emerald-700" : "text-slate-500",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-slate-400",
        ].join(" ")}
      />
      {active ? "Activo" : "Oculto"}
    </span>
  )
}

function StockStatus({ perfume }: { perfume: Perfume }) {
  const stock = perfume.inventory?.stockQuantity

  if (stock === undefined) {
    return <span className="text-xs text-slate-400">Sin configurar</span>
  }

  const tone =
    stock === 0
      ? "text-red-700"
      : stock <= 3
        ? "text-amber-700"
        : "text-emerald-700"

  return (
    <span className={`text-xs font-semibold ${tone}`}>
      {stock === 0 ? "Agotado" : `${stock} unidades`}
    </span>
  )
}

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
  onClearFilters,
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

  const changeStatus = (value: StatusFilter) => {
    setPage(1)
    onStatusFilterChange(value)
  }
  const hasActiveFilters = search.trim() !== "" || statusFilter !== "active"

  const clearSearch = () => {
    setPage(1)
    onSearchChange("")
  }

  const clearFilters = () => {
    setPage(1)
    onClearFilters()
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Inventario
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isLoading ? "Actualizando catálogo..." : `${perfumes.length} resultados`}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div
              aria-label="Filtrar por estado"
              className="flex h-10 w-full shrink-0 rounded-md border border-slate-200 bg-slate-50 p-1 sm:w-[220px]"
              role="group"
            >
              {STATUS_OPTIONS.map((option) => (
                <button
                  className={[
                    "min-w-0 flex-1 whitespace-nowrap rounded px-2 text-xs font-semibold transition",
                    statusFilter === option.value
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                  key={option.value}
                  type="button"
                  onClick={() => changeStatus(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="relative block w-full sm:w-72">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <span className="sr-only">Buscar perfumes</span>
              <input
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#8f334d] focus:ring-2 focus:ring-[#8f334d]/10"
                placeholder="Nombre, marca o SKU"
                value={search}
                onChange={(event) => {
                  setPage(1)
                  onSearchChange(event.target.value)
                }}
              />
              {search ? (
                <button
                  aria-label="Vaciar búsqueda"
                  className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  title="Vaciar búsqueda"
                  type="button"
                  onClick={clearSearch}
                >
                  <X aria-hidden="true" size={16} />
                </button>
              ) : null}
            </label>
            <button
              aria-label="Restablecer filtros"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!hasActiveFilters}
              title="Restablecer filtros"
              type="button"
              onClick={clearFilters}
            >
              <RotateCcw aria-hidden="true" size={16} />
            </button>
          </div>
        </div>

        {(error || status) && (
          <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
            {error ?? status}
          </p>
        )}
      </div>

      <div className="hidden lg:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] uppercase text-slate-500">
            <tr>
              <th className="w-[34%] px-4 py-3 font-semibold">Perfume</th>
              <th className="w-[13%] px-3 py-3 font-semibold">Presentación</th>
              <th className="w-[16%] px-3 py-3 font-semibold">Precio</th>
              <th className="w-[15%] px-3 py-3 font-semibold">Existencias</th>
              <th className="w-[11%] px-3 py-3 font-semibold">Estado</th>
              <th className="w-[11%] px-4 py-3 text-right font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visiblePerfumes.map((perfume) => {
              const isActive = perfume.isActive !== false
              const isDeleting = deletingId === perfume.id

              return (
                <tr className="transition hover:bg-slate-50/70" key={perfume.id}>
                  <td className="px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <PerfumeImage perfume={perfume} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {perfume.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {perfume.brand}
                          {perfume.inventory?.sku
                            ? ` · ${perfume.inventory.sku}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="truncate px-3 py-2.5 text-slate-600">
                    {formatPerfumeSize(perfume.inventory?.sizeMl)}
                  </td>
                  <td className="truncate px-3 py-2.5 font-medium text-slate-700">
                    {formatCatalogPrice(perfume.inventory?.salePrice)}
                  </td>
                  <td className="px-3 py-2.5">
                    <StockStatus perfume={perfume} />
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge active={isActive} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button
                        aria-label={`Editar ${perfume.name}`}
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                        title="Editar"
                        type="button"
                        onClick={() => onEdit(perfume)}
                      >
                        <Pencil aria-hidden="true" size={16} />
                      </button>
                      <button
                        aria-label={`Eliminar ${perfume.name}`}
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-40"
                        disabled={isDeleting}
                        title="Eliminar"
                        type="button"
                        onClick={() => onDelete(perfume.id)}
                      >
                        {isDeleting ? (
                          <LoaderCircle
                            aria-hidden="true"
                            className="animate-spin"
                            size={16}
                          />
                        ) : (
                          <Trash2 aria-hidden="true" size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!isLoading && perfumes.length === 0 && (
              <tr>
                <td className="px-4 py-12 text-center text-slate-500" colSpan={6}>
                  No hay perfumes que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {visiblePerfumes.map((perfume) => {
          const isActive = perfume.isActive !== false
          const isDeleting = deletingId === perfume.id

          return (
            <article className="p-4" key={perfume.id}>
              <div className="flex gap-3">
                <PerfumeImage perfume={perfume} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    {perfume.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {perfume.brand} ·{" "}
                    {formatPerfumeSize(perfume.inventory?.sizeMl)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {formatCatalogPrice(perfume.inventory?.salePrice)}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <StatusBadge active={isActive} />
                    <StockStatus perfume={perfume} />
                  </div>
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  <button
                    aria-label={`Editar ${perfume.name}`}
                    className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600"
                    type="button"
                    onClick={() => onEdit(perfume)}
                  >
                    <Pencil aria-hidden="true" size={16} />
                  </button>
                  <button
                    aria-label={`Eliminar ${perfume.name}`}
                    className="grid h-9 w-9 place-items-center rounded-md border border-red-100 text-red-600 disabled:opacity-40"
                    disabled={isDeleting}
                    type="button"
                    onClick={() => onDelete(perfume.id)}
                  >
                    {isDeleting ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="animate-spin"
                        size={16}
                      />
                    ) : (
                      <Trash2 aria-hidden="true" size={16} />
                    )}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
        {!isLoading && perfumes.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500">
            No hay perfumes que coincidan con la búsqueda.
          </p>
        ) : null}
      </div>

      <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {perfumes.length === 0
            ? "Sin resultados"
            : `${firstResult}-${lastResult} de ${perfumes.length}`}
        </span>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            aria-label="Página anterior"
            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft aria-hidden="true" size={17} />
          </button>
          <span className="min-w-20 text-center text-xs font-semibold text-slate-700">
            {safePage} de {totalPages}
          </span>
          <button
            aria-label="Página siguiente"
            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={safePage === totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            <ChevronRight aria-hidden="true" size={17} />
          </button>
        </div>
      </footer>
    </section>
  )
}
