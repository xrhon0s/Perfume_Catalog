import { useEffect, useMemo, useState, type FormEvent } from "react"
import type { Session } from "@supabase/supabase-js"
import AdminAlert from "../features/admin/components/AdminAlert"
import AdminForbidden from "../features/admin/components/AdminForbidden"
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
import { isCurrentUserAdmin } from "../services/adminAuth"
import { useCatalogStore } from "../store/catalogStore"

type StatusFilter = "active" | "inactive" | "all"
type Notice = {
  message: string
  tone: "success" | "error" | "info"
}

export default function Admin() {
  const perfumes = useCatalogStore((s) => s.perfumes)
  const isLoading = useCatalogStore((s) => s.isLoading)
  const error = useCatalogStore((s) => s.error)
  const loadAdminPerfumes = useCatalogStore((s) => s.loadAdminPerfumes)
  const savePerfume = useCatalogStore((s) => s.savePerfume)
  const deletePerfume = useCatalogStore((s) => s.deletePerfume)

  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [form, setForm] = useState<PerfumeFormState>(emptyPerfumeForm)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active")

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
    let cancelled = false

    async function loadAdmin() {
      if (!session) {
        setIsAdmin(false)
        setCheckingAdmin(false)
        return
      }

      setCheckingAdmin(true)
      try {
        const allowed = await isCurrentUserAdmin()
        if (cancelled) return

        setIsAdmin(allowed)
        if (allowed) {
          await loadAdminPerfumes()
        }
      } catch (adminError) {
        if (cancelled) return
        setIsAdmin(false)
        setNotice({
          tone: "error",
          message:
            adminError instanceof Error
              ? adminError.message
              : "No se pudo verificar el permiso admin.",
        })
      } finally {
        if (!cancelled) setCheckingAdmin(false)
      }
    }

    void loadAdmin()

    return () => {
      cancelled = true
    }
  }, [loadAdminPerfumes, session])

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return perfumes.filter((perfume) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active"
          ? perfume.isActive !== false
          : perfume.isActive === false)

      if (!matchesStatus) return false
      if (!normalized) return true

      return `${perfume.name} ${perfume.brand}`.toLowerCase().includes(normalized)
    })
  }, [perfumes, search, statusFilter])

  const updateField = <Field extends keyof PerfumeFormState>(
    field: Field,
    value: PerfumeFormState[Field],
  ) => {
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
      setNotice({
        tone: "error",
        message: "Revisa el formulario antes de guardar.",
      })
      return
    }

    setFormErrors([])
    setNotice({ tone: "info", message: "Guardando perfume..." })
    setSaving(true)

    try {
      await savePerfume(formToPerfumeInput(form))
      setForm(emptyPerfumeForm)
      setNotice({ tone: "success", message: "Perfume guardado correctamente." })
    } catch (saveError) {
      setNotice({
        tone: "error",
        message:
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar el perfume.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const perfume = perfumes.find((item) => item.id === id)
    const label = perfume ? `${perfume.brand} ${perfume.name}` : "este perfume"

    if (!window.confirm(`¿Eliminar ${label} del catálogo público?`)) {
      return
    }

    setNotice({ tone: "info", message: "Eliminando perfume del catálogo..." })
    setDeletingId(id)

    try {
      await deletePerfume(id)
      if (form.id === id) setForm(emptyPerfumeForm)
      setNotice({
        tone: "success",
        message: "Perfume eliminado del catálogo público.",
      })
    } catch (deleteError) {
      setNotice({
        tone: "error",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "No se pudo eliminar el perfume.",
      })
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

  if (checkingAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        Verificando permisos...
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <AdminForbidden
        email={session.user.email}
        userId={session.user.id}
        onLogout={() => void handleLogout()}
      />
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <AdminHeader onLogout={handleLogout} />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        {notice && (
          <div className="lg:col-span-2">
            <AdminAlert message={notice.message} tone={notice.tone} />
          </div>
        )}

        <PerfumeTable
          perfumes={filtered}
          isLoading={isLoading}
          status={null}
          error={error}
          search={search}
          statusFilter={statusFilter}
          deletingId={deletingId}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
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
