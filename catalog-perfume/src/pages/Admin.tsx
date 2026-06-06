import { useEffect, useMemo, useState, type FormEvent } from "react"
import type { Session } from "@supabase/supabase-js"
import type { Perfume } from "../data/types"
import { isSupabaseConfigured, supabase } from "../lib/supabase"
import { useCatalogStore } from "../store/catalogStore"
import type { PerfumeInput } from "../services/perfumeRepository"

const families = [
  "Cítrico",
  "Floral",
  "Amaderado",
  "Oriental",
  "Aromático",
  "Fougère",
  "Gourmand",
  "Acuático",
  "Chipre",
  "Cuero",
  "Ámbar",
  "Frutal",
  "Especiado",
] as const

const concentrations = ["EDT", "EDP", "Parfum", "Extrait"] as const
const genders = ["Masculino", "Femenino", "Unisex"] as const
const currentYear = new Date().getFullYear()

type FormState = {
  id: string
  name: string
  brand: string
  family: string
  concentration: string
  gender: string
  year: string
  description: string
  tags: string
  topNotes: string
  heartNotes: string
  baseNotes: string
}

const emptyForm: FormState = {
  id: "",
  name: "",
  brand: "",
  family: "",
  concentration: "",
  gender: "",
  year: "",
  description: "",
  tags: "",
  topNotes: "",
  heartNotes: "",
  baseNotes: "",
}

function joinValues(values?: string[]) {
  return values?.join(", ") ?? ""
}

function splitValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function perfumeToForm(perfume: Perfume): FormState {
  return {
    id: perfume.id,
    name: perfume.name,
    brand: perfume.brand,
    family: perfume.family ?? "",
    concentration: perfume.concentration ?? "",
    gender: perfume.gender ?? "",
    year: perfume.year ? String(perfume.year) : "",
    description: perfume.description ?? "",
    tags: joinValues(perfume.tags),
    topNotes: joinValues(perfume.notes?.top),
    heartNotes: joinValues(perfume.notes?.heart),
    baseNotes: joinValues(perfume.notes?.base),
  }
}

function formToPerfumeInput(form: FormState): PerfumeInput {
  return {
    id: form.id || undefined,
    name: form.name,
    brand: form.brand,
    family: (form.family || undefined) as PerfumeInput["family"],
    concentration: (form.concentration ||
      undefined) as PerfumeInput["concentration"],
    gender: (form.gender || undefined) as PerfumeInput["gender"],
    year: form.year ? Number(form.year) : undefined,
    description: form.description || undefined,
    tags: splitValues(form.tags),
    notes: {
      top: splitValues(form.topNotes),
      heart: splitValues(form.heartNotes),
      base: splitValues(form.baseNotes),
    },
    isActive: true,
  }
}

function validateForm(form: FormState) {
  const errors: string[] = []
  const year = form.year ? Number(form.year) : undefined

  if (form.name.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres.")
  }

  if (form.brand.trim().length < 2) {
    errors.push("La marca debe tener al menos 2 caracteres.")
  }

  if (!form.family) {
    errors.push("Selecciona una familia olfativa.")
  }

  if (!form.concentration) {
    errors.push("Selecciona una concentración.")
  }

  if (!form.gender) {
    errors.push("Selecciona un género.")
  }

  if (form.year && (!year || year < 1900 || year > currentYear + 1)) {
    errors.push(`El año debe estar entre 1900 y ${currentYear + 1}.`)
  }

  if (
    !form.topNotes.trim() &&
    !form.heartNotes.trim() &&
    !form.baseNotes.trim()
  ) {
    errors.push("Agrega al menos una nota olfativa.")
  }

  return errors
}

export default function Admin() {
  const perfumes = useCatalogStore((s) => s.perfumes)
  const isLoading = useCatalogStore((s) => s.isLoading)
  const error = useCatalogStore((s) => s.error)
  const loadAdminPerfumes = useCatalogStore((s) => s.loadAdminPerfumes)
  const savePerfume = useCatalogStore((s) => s.savePerfume)
  const deletePerfume = useCatalogStore((s) => s.deletePerfume)

  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [status, setStatus] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!supabase) return

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session) {
      void loadAdminPerfumes()
    }
  }, [loadAdminPerfumes, session])

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return perfumes

    return perfumes.filter((perfume) =>
      `${perfume.name} ${perfume.brand}`.toLowerCase().includes(normalized),
    )
  }, [perfumes, search])

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return

    setAuthError(null)
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setAuthError(loginError.message)
      return
    }

    setEmail("")
    setPassword("")
  }

  const handleLogout = async () => {
    await supabase?.auth.signOut()
    setForm(emptyForm)
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    const validationErrors = validateForm(form)

    if (validationErrors.length > 0) {
      setFormErrors(validationErrors)
      setStatus(null)
      return
    }

    setFormErrors([])
    setStatus("Guardando perfume...")
    setSaving(true)

    try {
      await savePerfume(formToPerfumeInput(form))
      setForm(emptyForm)
      setStatus("Perfume guardado.")
    } catch (saveError) {
      setStatus(saveError instanceof Error ? saveError.message : "No se pudo guardar.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const perfume = perfumes.find((item) => item.id === id)
    const label = perfume ? `${perfume.brand} ${perfume.name}` : "este perfume"

    if (!window.confirm(`¿Desactivar ${label}?`)) {
      return
    }

    setStatus("Desactivando perfume...")
    setDeletingId(id)

    try {
      await deletePerfume(id)
      if (form.id === id) setForm(emptyForm)
      setStatus("Perfume desactivado.")
    } catch (deleteError) {
      setStatus(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo desactivar el perfume.",
      )
    } finally {
      setDeletingId(null)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <a className="text-sm text-white/60 hover:text-white" href="#">
            ← Volver al catálogo
          </a>
          <h1 className="mt-8 text-3xl font-semibold">Administración</h1>
          <p className="mt-4 text-white/70">
            Para activar el CRUD necesitas configurar Supabase en `.env.local`
            usando las variables de `.env.example`.
          </p>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
            <p>Variables requeridas:</p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-black/30 p-3">
              VITE_SUPABASE_URL{"\n"}VITE_SUPABASE_ANON_KEY
            </pre>
          </div>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-sm">
          <a className="text-sm text-white/60 hover:text-white" href="#">
            ← Volver al catálogo
          </a>
          <h1 className="mt-8 text-3xl font-semibold">Ingreso admin</h1>
          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            <label className="block text-sm">
              Email
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-white/40"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              Contraseña
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-white/40"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {authError && <p className="text-sm text-red-300">{authError}</p>}
            <button className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-white/90">
              Entrar
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <a className="text-sm text-slate-500 hover:text-slate-900" href="#">
              ← Catálogo
            </a>
            <h1 className="mt-1 text-2xl font-semibold">Administración</h1>
          </div>
          <button
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            onClick={handleLogout}
          >
            Salir
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Perfumes</h2>
              <p className="text-sm text-slate-500">
                {isLoading ? "Cargando..." : `${filtered.length} resultados`}
              </p>
            </div>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-400 sm:w-72"
              placeholder="Buscar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {(error || status) && (
            <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {error ?? status}
            </p>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="min-w-52 px-3 py-3">Perfume</th>
                  <th className="min-w-36 px-3 py-3">Marca</th>
                  <th className="min-w-32 px-3 py-3">Familia</th>
                  <th className="min-w-36 px-3 py-3">Perfil</th>
                  <th className="min-w-44 px-3 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((perfume) => (
                  <tr key={perfume.id}>
                    <td className="px-3 py-3 font-medium">{perfume.name}</td>
                    <td className="px-3 py-3 text-slate-600">{perfume.brand}</td>
                    <td className="px-3 py-3 text-slate-600">
                      {perfume.family ?? "Sin familia"}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {[perfume.concentration, perfume.gender, perfume.year]
                        .filter(Boolean)
                        .join(" · ") || "Sin perfil"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-lg border px-3 py-1.5 font-medium hover:bg-slate-50"
                          onClick={() => setForm(perfumeToForm(perfume))}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50"
                          disabled={deletingId === perfume.id}
                          onClick={() => void handleDelete(perfume.id)}
                        >
                          {deletingId === perfume.id ? "..." : "Desactivar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td className="px-3 py-8 text-center text-slate-500" colSpan={5}>
                      No hay perfumes que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <form className="rounded-lg bg-white p-4 shadow-sm" onSubmit={handleSave}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {form.id ? "Editar perfume" : "Nuevo perfume"}
            </h2>
            <button
              className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50"
              type="button"
              onClick={() => setForm(emptyForm)}
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
                onChange={(event) => updateField("name", event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-medium">
              Marca
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
                value={form.brand}
                onChange={(event) => updateField("brand", event.target.value)}
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                Familia
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
                  value={form.family}
                  onChange={(event) => updateField("family", event.target.value)}
                  required
                >
                  <option value="">Seleccionar</option>
                  {families.map((family) => (
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
                  max={currentYear + 1}
                  value={form.year}
                  onChange={(event) => updateField("year", event.target.value)}
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
                    updateField("concentration", event.target.value)
                  }
                  required
                >
                  <option value="">Seleccionar</option>
                  {concentrations.map((concentration) => (
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
                  onChange={(event) => updateField("gender", event.target.value)}
                  required
                >
                  <option value="">Seleccionar</option>
                  {genders.map((gender) => (
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
                onChange={(event) => updateField("description", event.target.value)}
              />
            </label>

            <label className="block text-sm font-medium">
              Tags
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 font-normal outline-none focus:border-slate-400"
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                placeholder="dulce, fresco, oud"
              />
            </label>

            <div className="grid gap-3">
              <p className="text-sm font-medium">Notas olfativas</p>
              <input
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={form.topNotes}
                onChange={(event) => updateField("topNotes", event.target.value)}
                placeholder="Notas de salida"
              />
              <input
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={form.heartNotes}
                onChange={(event) => updateField("heartNotes", event.target.value)}
                placeholder="Notas de corazón"
              />
              <input
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={form.baseNotes}
                onChange={(event) => updateField("baseNotes", event.target.value)}
                placeholder="Notas de fondo"
              />
            </div>

            {formErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {formErrors.map((formError) => (
                  <p key={formError}>{formError}</p>
                ))}
              </div>
            )}

            <button
              className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar perfume"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
