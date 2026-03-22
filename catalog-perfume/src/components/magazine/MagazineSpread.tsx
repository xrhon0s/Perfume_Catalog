import MagazinePage from "./MagazinePage"
import type { Perfume } from "../../data/perfumes"

type Props = {
  left: Perfume
  right: Perfume | null
}

export default function MagazineSpread({ left, right }: Props) {
  return (
    <div className="h-full w-full flex items-stretch overflow-hidden bg-white">
      {/* Página izquierda */}
      <div className="w-1/2">
        <MagazinePage
          side="left"
          title={left.name}
          subtitle={left.perfumerie}
          imageUrl={left.image}
          onView={() => console.log("Ver", left.id)}
        />
      </div>

      {/* Lomo / división central */}
      <div className="relative w-[10px] shrink-0">
  {/* sombra suave hacia la izquierda */}
  <div className="absolute inset-y-0 left-0 w-1/2 bg-black/10" />
  {/* brillo suave hacia la derecha */}
  <div className="absolute inset-y-0 right-0 w-1/2 bg-white/20" />
  {/* línea central finita */}
  <div className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-black/20" />
</div>



      {/* Página derecha */}
      <div className="w-1/2">
        {right ? (
          <MagazinePage
            side="right"
            title={right.name}
            subtitle={right.perfumerie}
            imageUrl={right.image}
            onView={() => console.log("Ver", right.id)}
          />
        ) : (
          <MagazinePage side="right" />
        )}
      </div>
    </div>
  )
}
