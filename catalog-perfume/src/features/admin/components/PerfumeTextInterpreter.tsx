import { useMemo, useState } from "react"
import type { PerfumeFormState } from "../lib/perfumeForm"
import {
  parsePerfumeText,
  parsedEntries,
  type ParsedPerfumeFields,
} from "../lib/parsePerfumeText"

type PerfumeTextInterpreterProps = {
  form: PerfumeFormState
  onFieldChange: <Field extends keyof PerfumeFormState>(
    field: Field,
    value: PerfumeFormState[Field],
  ) => void
}

const FIELD_LABELS: Record<keyof ParsedPerfumeFields, string> = {
  name: "Nombre",
  brand: "Marca",
  family: "Familia",
  concentration: "Concentración",
  gender: "Género",
  year: "Año",
  description: "Descripción",
  tags: "Tags",
  topNotes: "Salida",
  heartNotes: "Corazón",
  baseNotes: "Fondo",
}

export default function PerfumeTextInterpreter({
  form,
  onFieldChange,
}: PerfumeTextInterpreterProps) {
  const [text, setText] = useState("")
  const [parsed, setParsed] = useState<ParsedPerfumeFields>({})
  const entries = useMemo(() => parsedEntries(parsed), [parsed])

  const handleParse = () => {
    setParsed(parsePerfumeText(text))
  }

  const handleClear = () => {
    setText("")
    setParsed({})
  }

  const applyParsed = (overwrite: boolean) => {
    for (const [field, value] of entries) {
      const formField = field as keyof ParsedPerfumeFields
      if (!overwrite && form[formField]) continue
      onFieldChange(formField, value as PerfumeFormState[typeof formField])
    }
  }

  return (
    <section className="rounded-lg border bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Intérprete de ficha</h3>
          <p className="text-xs text-slate-500">
            Pega texto de otra fuente y extrae los campos del perfume.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={!text.trim() && entries.length === 0}
            onClick={handleClear}
          >
            Limpiar
          </button>
          <button
            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="button"
            disabled={!text.trim()}
            onClick={handleParse}
          >
            Interpretar
          </button>
        </div>
      </div>

      <textarea
        className="mt-3 min-h-28 w-full rounded-lg border bg-white px-3 py-2 text-sm font-normal outline-none focus:border-slate-400"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Ej: Lattafa Yara Candy es una fragancia femenina lanzada en 2024. Es un EDP gourmand/frutal. Notas de salida: ..."
      />

      {entries.length > 0 ? (
        <div className="mt-3 space-y-3">
          <div className="grid gap-2 text-xs">
            {entries.map(([field, value]) => (
              <div
                className="rounded-md border bg-white px-2 py-1.5"
                key={field}
              >
                <span className="font-semibold text-slate-500">
                  {FIELD_LABELS[field as keyof ParsedPerfumeFields]}:
                </span>{" "}
                <span className="text-slate-800">{value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-100"
              type="button"
              onClick={() => applyParsed(false)}
            >
              Aplicar vacíos
            </button>
            <button
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              type="button"
              onClick={() => applyParsed(true)}
            >
              Sobrescribir
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
