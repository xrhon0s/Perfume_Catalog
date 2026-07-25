import type { FormEvent } from "react"
import {
  CONCENTRATIONS,
  GENDERS,
  OLFACTIVE_FAMILIES,
} from "../../../shared/constants/perfumeOptions"
import type { PerfumeFormState } from "../lib/perfumeForm"
import { currentCatalogYear } from "../lib/validatePerfumeForm"

type PerfumeFormProps = {
  form: PerfumeFormState
  errors: string[]
  saving: boolean
  uploadingImage: boolean
  uploadStats: string | null
  onSubmit: (event: FormEvent) => void
  onReset: () => void
  onFieldChange: <Field extends keyof PerfumeFormState>(
    field: Field,
    value: PerfumeFormState[Field],
  ) => void
  onImageUpload: (file: File) => void
}

export default function PerfumeForm({
  form,
  errors,
  saving,
  uploadingImage,
  uploadStats,
  onSubmit,
  onReset,
  onFieldChange,
  onImageUpload,
}: PerfumeFormProps) {
  return (
    <form className="rounded-lg bg-white p-4 shadow-sm" onSubmit={onSubmit}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {form.id ? "Editar perfume" : "Nuevo perfume"}
        </h2>
        <button
          className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          type="button"
          onClick={onReset}
        >
          Limpiar
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <label className="block text-sm font-medium">
          Nombre
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
            value={form.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            required
          />
        </label>

        <label className="block text-sm font-medium">
          Marca
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
            value={form.brand}
            onChange={(event) => onFieldChange("brand", event.target.value)}
            required
          />
        </label>

        <section className="rounded-lg border bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Imagen principal</h3>
              <p className="text-xs text-slate-500">
                Sube una imagen liviana o pega una URL existente.
              </p>
            </div>
            <label className="cursor-pointer rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
              {uploadingImage ? "Subiendo..." : "Subir imagen"}
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

          <div className="mt-3 overflow-hidden rounded-lg border bg-white">
            {form.image ? (
              <img
                alt=""
                className="h-44 w-full object-cover"
                src={form.image}
              />
            ) : (
              <div className="flex h-32 items-center justify-center text-sm font-medium text-slate-400">
                Sin imagen
              </div>
            )}
          </div>

          <label className="mt-3 block text-xs font-medium text-slate-600">
            URL de imagen
            <input
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm font-normal text-slate-950 outline-none focus:border-slate-400"
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
            <p className="mt-2 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              {uploadStats}
            </p>
          ) : null}
        </section>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            Familia
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
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
          <label className="block text-sm font-medium">
            Año
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
              type="number"
              min="1900"
              max={currentCatalogYear + 1}
              value={form.year}
              onChange={(event) => onFieldChange("year", event.target.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            Concentración
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
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
          <label className="block text-sm font-medium">
            Género
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
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

        <label className="block text-sm font-medium">
          Descripción
          <textarea
            className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
            value={form.description}
            onChange={(event) => onFieldChange("description", event.target.value)}
          />
        </label>

        <label className="block text-sm font-medium">
          Tags
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
            value={form.tags}
            onChange={(event) => onFieldChange("tags", event.target.value)}
            placeholder="dulce, fresco, oud"
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-lg border px-3 py-3 text-sm font-medium">
          <span>
            Visible en catálogo
            <span className="block text-xs font-normal text-slate-500">
              Desactívalo para ocultar el perfume sin borrarlo.
            </span>
          </span>
          <input
            checked={form.isActive}
            className="h-4 w-4 accent-slate-950"
            type="checkbox"
            onChange={(event) =>
              onFieldChange("isActive", event.target.checked)
            }
          />
        </label>

        <div className="grid gap-3">
          <p className="text-sm font-medium">Notas olfativas</p>
          <input
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={form.topNotes}
            onChange={(event) => onFieldChange("topNotes", event.target.value)}
            placeholder="Notas de salida"
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={form.heartNotes}
            onChange={(event) => onFieldChange("heartNotes", event.target.value)}
            placeholder="Notas de corazón"
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={form.baseNotes}
            onChange={(event) => onFieldChange("baseNotes", event.target.value)}
            placeholder="Notas de fondo"
          />
        </div>

        {errors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errors.map((formError) => (
              <p key={formError}>{formError}</p>
            ))}
          </div>
        )}

        <button
          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={saving || uploadingImage}
        >
          {saving ? "Guardando..." : "Guardar perfume"}
        </button>
      </div>
    </form>
  )
}
