import { useEffect, useId } from "react"
import type { Perfume } from "../../data/types"

type Props = {
  perfume: Perfume
  onClose: () => void
}

export default function PerfumeDetailModal({ perfume, onClose }: Props) {
  const titleId = useId()

  // Cerrar con Escape + bloquear scroll
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[9998]">
      {/* Fondo oscuro */}
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-label="Cerrar detalle"
      />

      {/* Caja */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute left-1/2 top-1/2 w-[min(900px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Imagen */}
          <div className="bg-gray-100">
            {perfume.image ? (
              <img
                src={perfume.image}
                alt={perfume.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-72 w-full items-center justify-center text-gray-400 md:h-full">
                Sin imagen
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">{perfume.brand}</p>
                <h2 id={titleId} className="mt-1 text-2xl font-semibold">
                  {perfume.name}
                </h2>

                {/* Si tu tipo Perfume tiene campos extra, puedes descomentar */}
                {/* {perfume.brand && (
                  <p className="mt-1 text-sm text-gray-600">{perfume.brand}</p>
                )}
                {perfume.price && (
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {perfume.price}
                  </p>
                )} */}
              </div>

              <button
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-700">
              <p>
                Aquí pondremos más info del perfume (notas, familia olfativa,
                duración, etc.). Por ahora es un detalle base.
              </p>

              {/* Ejemplo si tienes descripción */}
              {/* {perfume.description && <p>{perfume.description}</p>} */}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Guardar / Favorito
              </button>
              <button className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-black hover:bg-gray-200">
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
