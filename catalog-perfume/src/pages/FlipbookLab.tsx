import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState } from "react"
import type { Perfume } from "../data/types"
import { getPerfumes } from "../data/getPerfumes"

const preferredIds = [
  "bond-no9-hamptons-bond-no-9",
  "bond-no9-bleecker-street-bond-no-9",
  "bond-no9-chinatown-bond-no-9",
  "bond-no9-brooklyn-bond-no-9",
]

function getLabPerfumes() {
  const all = getPerfumes().filter((perfume) => perfume.image)
  const preferred = preferredIds
    .map((id) => all.find((perfume) => perfume.id === id))
    .filter((perfume): perfume is Perfume => Boolean(perfume))
  const rest = all.filter((perfume) => !preferredIds.includes(perfume.id))

  return [...preferred, ...rest].slice(0, 12)
}

function LabPage({
  perfume,
  side,
}: {
  perfume?: Perfume
  side: "left" | "right"
}) {
  if (!perfume) {
    return <div className="h-full w-full bg-white" />
  }

  const profile = [
    perfume.family,
    perfume.concentration,
    perfume.gender,
    perfume.year,
  ].filter(Boolean)

  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden bg-white">
      <div className="flex min-h-0 flex-1 items-center justify-center px-10 py-8">
        <img
          src={perfume.image}
          alt={perfume.name}
          className="max-h-full max-w-full object-contain drop-shadow-2xl"
          loading="eager"
        />
      </div>

      <div
        className={[
          "border-t border-slate-200 px-8 py-6",
          side === "left" ? "text-left" : "text-right",
        ].join(" ")}
      >
        <p className="text-xs font-semibold uppercase text-slate-500">
          {perfume.brand}
        </p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight text-slate-950">
          {perfume.name}
        </h2>
        {profile.length > 0 && (
          <p className="mt-3 text-sm text-slate-600">{profile.join(" · ")}</p>
        )}
      </div>
    </article>
  )
}

export default function FlipbookLab() {
  const perfumes = useMemo(() => getLabPerfumes(), [])
  const [spreadIndex, setSpreadIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [duration, setDuration] = useState(420)

  const left = perfumes[spreadIndex]
  const right = perfumes[spreadIndex + 1]
  const pageLabel = `${spreadIndex + 1}-${Math.min(spreadIndex + 2, perfumes.length)}`

  const goNext = () => {
    setDirection(1)
    setSpreadIndex((current) => Math.min(current + 2, Math.max(0, perfumes.length - 2)))
  }

  const goPrev = () => {
    setDirection(-1)
    setSpreadIndex((current) => Math.max(0, current - 2))
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 px-5 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <a className="text-sm text-white/55 hover:text-white" href="#">
              ← Catálogo
            </a>
            <h1 className="mt-2 text-2xl font-semibold">Lab flipbook</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
              onClick={goPrev}
            >
              Anterior
            </button>
            <button
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-white/90"
              onClick={goNext}
            >
              Siguiente
            </button>
            <label className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-sm">
              <span>{duration}ms</span>
              <input
                min="220"
                max="850"
                step="20"
                type="range"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
              />
            </label>
          </div>
        </div>
      </header>

      <section className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>{pageLabel} / {perfumes.length}</span>
          <span>Animación propia, sin react-pageflip</span>
        </div>

        <div className="relative aspect-[16/9] min-h-[560px] overflow-hidden rounded-lg bg-slate-900 shadow-2xl ring-1 ring-white/10 [perspective:1800px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={spreadIndex}
              className="absolute inset-0 grid grid-cols-2 overflow-hidden rounded-lg bg-white text-slate-950"
              custom={direction}
              initial={{
                opacity: 0.35,
                rotateY: direction > 0 ? -28 : 28,
                x: direction > 0 ? 120 : -120,
              }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{
                opacity: 0.25,
                rotateY: direction > 0 ? 24 : -24,
                x: direction > 0 ? -100 : 100,
              }}
              transition={{
                duration: duration / 1000,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="border-r border-slate-200">
                <LabPage perfume={left} side="left" />
              </div>
              <LabPage perfume={right} side="right" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {perfumes.slice(0, 8).map((perfume, index) => (
            <button
              key={perfume.id}
              className="flex items-center gap-3 rounded-lg bg-white/8 p-3 text-left hover:bg-white/12"
              onClick={() => {
                setDirection(index > spreadIndex ? 1 : -1)
                setSpreadIndex(index % 2 === 0 ? index : index - 1)
              }}
            >
              <img
                src={perfume.image}
                alt=""
                className="h-14 w-12 rounded bg-white object-contain"
              />
              <span>
                <span className="block text-sm font-semibold">{perfume.name}</span>
                <span className="block text-xs text-white/50">{perfume.brand}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
