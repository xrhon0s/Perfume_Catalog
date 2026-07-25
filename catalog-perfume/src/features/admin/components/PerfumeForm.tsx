import type { FormEvent } from "react"
import {
  AlertCircle,
  CheckCircle2,
  ImageOff,
  LoaderCircle,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react"
import {
  CONCENTRATIONS,
  GENDERS,
  OLFACTIVE_FAMILIES,
} from "../../../shared/constants/perfumeOptions"
import type { PerfumeFormState } from "../lib/perfumeForm"
import { currentCatalogYear } from "../lib/validatePerfumeForm"
import PerfumeTextInterpreter from "./PerfumeTextInterpreter"

type PerfumeFormProps = {
  form: PerfumeFormState
  errors: string[]
  saving: boolean
  uploadingImage: boolean
  removingImage: boolean
  uploadStats: string | null
  onSubmit: (event: FormEvent) => void
  onReset: () => void
  onImageRemove: () => void
  onFieldChange: <Field extends keyof PerfumeFormState>(
    field: Field,
    value: PerfumeFormState[Field],
  ) => void
  onImageUpload: (file: File) => void
}

const inputClass =
  "mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#8f334d] focus:ring-2 focus:ring-[#8f334d]/10"
const labelClass = "block text-xs font-semibold text-slate-600"

export default function PerfumeForm({
  form,
  errors,
  saving,
  uploadingImage,
  removingImage,
  uploadStats,
  onSubmit,
  onReset,
  onImageRemove,
  onFieldChange,
  onImageUpload,
}: PerfumeFormProps) {
  return (
    <form
      className="scroll-mt-20 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto"
      id="perfume-form"
      onSubmit={onSubmit}
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-950">
              {form.id ? "Editar perfume" : "Nuevo perfume"}
            </h2>
            {form.id ? (
              <span className="rounded bg-[#8f334d]/10 px-2 py-0.5 text-[11px] font-semibold text-[#8f334d]">
                En edición
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {form.id && form.name ? form.name : "Completa la ficha del producto"}
          </p>
        </div>
        <button
          aria-label="Limpiar formulario"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          title="Limpiar formulario"
          type="button"
          onClick={onReset}
        >
          <RotateCcw aria-hidden="true" size={16} />
        </button>
      </header>

      <div className="space-y-6 p-5">
        <PerfumeTextInterpreter form={form} onFieldChange={onFieldChange} />

        <section>
          <h3 className="text-sm font-semibold text-slate-900">Identidad</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <label className={labelClass}>
              Nombre
              <input
                className={inputClass}
                value={form.name}
                onChange={(event) => onFieldChange("name", event.target.value)}
                required
              />
            </label>
            <label className={labelClass}>
              Marca
              <input
                className={inputClass}
                value={form.brand}
                onChange={(event) => onFieldChange("brand", event.target.value)}
                required
              />
            </label>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Imagen principal
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Se optimiza a WebP antes de subir.
              </p>
            </div>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-black has-[:disabled]:cursor-wait has-[:disabled]:opacity-60">
              {uploadingImage ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={15}
                />
              ) : (
                <Upload aria-hidden="true" size={15} />
              )}
              {uploadingImage ? "Subiendo" : "Subir"}
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (file) onImageUpload(file)
                }}
              />
            </label>
          </div>

          <div className="mt-3 grid h-44 place-items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            {form.image ? (
              <img
                alt={`Vista previa de ${form.name || "perfume"}`}
                className="h-full w-full object-contain p-2"
                src={form.image}
              />
            ) : (
              <div className="text-center text-slate-400">
                <ImageOff aria-hidden="true" className="mx-auto" size={24} />
                <p className="mt-2 text-xs font-medium">Sin imagen</p>
              </div>
            )}
          </div>

          {form.image ? (
            <button
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
              type="button"
              disabled={removingImage || uploadingImage}
              onClick={onImageRemove}
            >
              {removingImage ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={15}
                />
              ) : (
                <Trash2 aria-hidden="true" size={15} />
              )}
              {removingImage ? "Eliminando imagen" : "Eliminar imagen"}
            </button>
          ) : null}

          <label className={`${labelClass} mt-3`}>
            URL externa
            <input
              className={inputClass}
              type="url"
              value={form.image}
              onChange={(event) => {
                onFieldChange("image", event.target.value)
                onFieldChange("imagePath", "")
              }}
              placeholder="https://..."
            />
          </label>

          {uploadStats ? (
            <p className="mt-2 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              <CheckCircle2 aria-hidden="true" className="shrink-0" size={15} />
              {uploadStats}
            </p>
          ) : null}
        </section>

        <section className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold text-slate-900">Clasificación</h3>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <label className={labelClass}>
              Familia
              <select
                className={inputClass}
                value={form.family}
                onChange={(event) => onFieldChange("family", event.target.value)}
                required
              >
                <option value="">Seleccionar</option>
                {OLFACTIVE_FAMILIES.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Año
              <input
                className={inputClass}
                type="number"
                min="1900"
                max={currentCatalogYear + 1}
                value={form.year}
                onChange={(event) => onFieldChange("year", event.target.value)}
              />
            </label>
            <label className={labelClass}>
              Concentración
              <select
                className={inputClass}
                value={form.concentration}
                onChange={(event) =>
                  onFieldChange("concentration", event.target.value)
                }
                required
              >
                <option value="">Seleccionar</option>
                {CONCENTRATIONS.map((concentration) => (
                  <option key={concentration} value={concentration}>
                    {concentration}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Género
              <select
                className={inputClass}
                value={form.gender}
                onChange={(event) => onFieldChange("gender", event.target.value)}
                required
              >
                <option value="">Seleccionar</option>
                {GENDERS.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold text-slate-900">Contenido</h3>
          <div className="mt-3 space-y-4">
            <label className={labelClass}>
              Descripción
              <textarea
                className={`${inputClass} min-h-28 resize-y py-2.5`}
                value={form.description}
                onChange={(event) =>
                  onFieldChange("description", event.target.value)
                }
              />
            </label>
            <label className={labelClass}>
              Tags
              <input
                className={inputClass}
                value={form.tags}
                onChange={(event) => onFieldChange("tags", event.target.value)}
                placeholder="dulce, fresco, oud"
              />
            </label>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-5">
          <h3 className="text-sm font-semibold text-slate-900">
            Pirámide olfativa
          </h3>
          <div className="mt-3 space-y-3">
            <label className={labelClass}>
              Salida
              <input
                className={inputClass}
                value={form.topNotes}
                onChange={(event) =>
                  onFieldChange("topNotes", event.target.value)
                }
                placeholder="Bergamota, mandarina"
              />
            </label>
            <label className={labelClass}>
              Corazón
              <input
                className={inputClass}
                value={form.heartNotes}
                onChange={(event) =>
                  onFieldChange("heartNotes", event.target.value)
                }
                placeholder="Jazmín, rosa"
              />
            </label>
            <label className={labelClass}>
              Fondo
              <input
                className={inputClass}
                value={form.baseNotes}
                onChange={(event) =>
                  onFieldChange("baseNotes", event.target.value)
                }
                placeholder="Ámbar, vainilla"
              />
            </label>
          </div>
        </section>

        <label className="flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
          <span>
            <span className="block text-sm font-semibold text-slate-900">
              Visible en catálogo
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Ocúltalo sin eliminar sus datos.
            </span>
          </span>
          <span className="relative inline-flex shrink-0 items-center">
            <input
              checked={form.isActive}
              className="peer sr-only"
              type="checkbox"
              onChange={(event) =>
                onFieldChange("isActive", event.target.checked)
              }
            />
            <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-[#8f334d] peer-focus-visible:ring-2 peer-focus-visible:ring-[#8f334d]/30" />
            <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
          </span>
        </label>

        {errors.length > 0 ? (
          <div
            className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800"
            role="alert"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={17}
            />
            <div>
              {errors.map((formError) => (
                <p key={formError}>{formError}</p>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-slate-200 bg-white px-5 py-4">
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#8f334d] px-4 text-sm font-semibold text-white transition hover:bg-[#76283e] disabled:cursor-wait disabled:bg-slate-400"
          disabled={saving || uploadingImage}
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
          ) : (
            <Save aria-hidden="true" size={18} />
          )}
          {saving ? "Guardando..." : form.id ? "Guardar cambios" : "Crear perfume"}
        </button>
      </footer>
    </form>
  )
}
