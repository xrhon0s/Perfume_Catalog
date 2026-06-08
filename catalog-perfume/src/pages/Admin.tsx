import { useEffect, useMemo, useState, type FormEvent } from "react"
import type { Session } from "@supabase/supabase-js"
import AdminHeader from "../features/admin/components/AdminHeader"
import AdminLogin from "../features/admin/components/AdminLogin"
import AdminUnavailable from "../features/admin/components/AdminUnavailable"
import PerfumeForm from "../features/admin/components/PerfumeForm"
import PerfumeTable from "../features/admin/components/PerfumeTable"
import {
  emptyPerfumeForm,
  formToPerfumeInput,
  perfumeToForm,
  type PerfumeFormState,
} from "../features/admin/lib/perfumeForm"
import { validatePerfumeForm } from "../features/admin/lib/validatePerfumeForm"
import { isSupabaseConfigured, supabase } from "../lib/supabase"
import { useCatalogStore } from "../store/catalogStore"

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
  const [form, setForm] = useState<PerfumeFormState>(emptyPerfumeForm)
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

  const updateField = (field: keyof PerfumeFormState, value: string) => {
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
    setForm(emptyPerfumeForm)
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    const validationErrors = validatePerfumeForm(form)

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
      setForm(emptyPerfumeForm)
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
      if (form.id === id) setForm(emptyPerfumeForm)
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
    return <AdminUnavailable />
  }

  if (!session) {
    return (
      <AdminLogin
        email={email}
        password={password}
        error={authError}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <AdminHeader onLogout={handleLogout} />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <PerfumeTable
          perfumes={filtered}
          isLoading={isLoading}
          status={status}
          error={error}
          search={search}
          deletingId={deletingId}
          onSearchChange={setSearch}
          onEdit={(perfume) => setForm(perfumeToForm(perfume))}
          onDelete={(id) => void handleDelete(id)}
        />

        <PerfumeForm
          form={form}
          errors={formErrors}
          saving={saving}
          onSubmit={handleSave}
          onReset={() => setForm(emptyPerfumeForm)}
          onFieldChange={updateField}
        />
      </div>
    </main>
  )
}

