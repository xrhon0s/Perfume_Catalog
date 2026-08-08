import { useMemo, useState } from "react"
import { ChevronDown, Eraser, Sparkles, WandSparkles } from "lucide-react"
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
  sku: "SKU",
  sizeMl: "Tamaño",
  salePrice: "Precio",
  stockQuantity: "Existencias",
}

export default function PerfumeTextInterpreter({
  form,
  onFieldChange,
}: PerfumeTextInterpreterProps) {
  const [text, setText] = useState("")
  const [parsed, setParsed] = useState<ParsedPerfumeFields>({})
  const entries = useMemo(() => parsedEntries(parsed), [parsed])

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
    <details className="group overflow-hidden rounded-md border border-slate-200 bg-[#fafaf7]">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#8f334d]/10 text-[#8f334d]">
          <WandSparkles aria-hidden="true" size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900">
            Intérprete de ficha
          </span>
          <span className="block truncate text-xs text-slate-500">
            Convierte texto en campos editables
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="text-slate-400 transition group-open:rotate-180"
          size={18}
        />
      </summary>

      <div className="border-t border-slate-200 p-4">
        <textarea
          className="min-h-32 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-[#8f334d] focus:ring-2 focus:ring-[#8f334d]/10"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Pega aquí la ficha completa del perfume..."
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={!text.trim() && entries.length === 0}
            onClick={handleClear}
          >
            <Eraser aria-hidden="true" size={15} />
            Limpiar
          </button>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={!text.trim()}
            onClick={() => setParsed(parsePerfumeText(text))}
          >
            <Sparkles aria-hidden="true" size={15} />
            Interpretar
          </button>
        </div>

        {entries.length > 0 ? (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200 bg-white px-3">
              {entries.map(([field, value]) => (
                <div className="py-2 text-xs leading-5" key={field}>
                  <span className="font-semibold text-slate-500">
                    {FIELD_LABELS[field as keyof ParsedPerfumeFields]}:
                  </span>{" "}
                  <span className="text-slate-800">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={() => applyParsed(false)}
              >
                Aplicar vacíos
              </button>
              <button
                className="h-9 rounded-md bg-[#8f334d] px-3 text-xs font-semibold text-white transition hover:bg-[#76283e]"
                type="button"
                onClick={() => applyParsed(true)}
              >
                Sobrescribir
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </details>
  )
}
