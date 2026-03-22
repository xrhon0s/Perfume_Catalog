type PerfumeCardProps = {
  name: string
  perfumerie: string
  imageUrl?: string
}

export default function PerfumeCard({ name, perfumerie, imageUrl }: PerfumeCardProps) {
  return (
    <article className="rounded-2xl overflow-hidden">

      {/* Imagen (opcional) */}
      <div className="h-40 bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
            Sin imagen
          </div>
        )}
      </div>

      {/* Texto */}
      <div className="p-4">
        <p className="text-xs text-gray-500">{perfumerie}</p>
        <h3 className="text-lg font-semibold leading-tight">{name}</h3>

        <button className="mt-3 text-sm px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
          Ver
        </button>
      </div>
    </article>
  )
}
