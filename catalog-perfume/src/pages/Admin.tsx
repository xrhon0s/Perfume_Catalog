import { useEffect, useMemo, useState, type FormEvent } from "react"
import type { Session } from "@supabase/supabase-js"
import { LoaderCircle, Plus } from "lucide-react"
import AdminAccessLayout from "../features/admin/components/AdminAccessLayout"
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
import {
  getPerfumeImageStoragePath,
  type UploadedPerfumeImage,
} from "../services/perfumeRepository"
import { useCatalogStore } from "../store/catalogStore"

type StatusFilter = "active" | "inactive" | "all"
type Notice = {
  message: string
  tone: "success" | "error" | "info"
}

type UploadStats = NonNullable<UploadedPerfumeImage["optimization"]>

function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 1024 * 1024 ? 1 : 2)} MB`
}

function formatUploadStats(stats: UploadStats) {
  return `Reducida ${stats.savedPercent}%: ${formatMegabytes(
    stats.originalBytes,
  )} -> ${formatMegabytes(stats.optimizedBytes)}`
}

export default function Admin() {
  const perfumes = useCatalogStore((s) => s.perfumes)
  const isLoading = useCatalogStore((s) => s.isLoading)
  const error = useCatalogStore((s) => s.error)
  const loadAdminPerfumes = useCatalogStore((s) => s.loadAdminPerfumes)
  const savePerfume = useCatalogStore((s) => s.savePerfume)
  const deletePerfume = useCatalogStore((s) => s.deletePerfume)
  const uploadPerfumeImage = useCatalogStore((s) => s.uploadPerfumeImage)
  const deletePerfumeImage = useCatalogStore((s) => s.deletePerfumeImage)

  const [session, setSession] = useState<Session | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authenticating, setAuthenticating] = useState(false)
  const [form, setForm] = useState<PerfumeFormState>(emptyPerfumeForm)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [removingImage, setRemovingImage] = useState(false)
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null)
  const [pendingImagePath, setPendingImagePath] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active")
  const sessionUserId = session?.user.id

  useEffect(() => {
    if (!supabase) return

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionReady(true)
    })

    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === "TOKEN_REFRESHED") return
      setSession(currentSession)
      setSessionReady(true)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadAdmin() {
      if (!sessionUserId) {
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
  }, [loadAdminPerfumes, sessionUserId])

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

      return `${perfume.name} ${perfume.brand} ${perfume.inventory?.sku ?? ""}`
        .toLowerCase()
        .includes(normalized)
    })
  }, [perfumes, search, statusFilter])

  const activeCount = useMemo(
    () => perfumes.filter((perfume) => perfume.isActive !== false).length,
    [perfumes],
  )
  const outOfStockCount = useMemo(
    () =>
      perfumes.filter(
        (perfume) =>
          perfume.inventory && perfume.inventory.stockQuantity === 0,
      ).length,
    [perfumes],
  )
  const stockUnits = useMemo(
    () =>
      perfumes.reduce(
        (total, perfume) => total + (perfume.inventory?.stockQuantity ?? 0),
        0,
      ),
    [perfumes],
  )

  const updateField = <Field extends keyof PerfumeFormState>(
    field: Field,
    value: PerfumeFormState[Field],
  ) => {
    if (field === "image") setUploadStats(null)
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return

    setAuthError(null)
    setAuthenticating(true)
    try {
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
    } finally {
      setAuthenticating(false)
    }
  }

  const handleLogout = async () => {
    await supabase?.auth.signOut()
    setForm(emptyPerfumeForm)
  }

  const resetForm = () => {
    setForm(emptyPerfumeForm)
    setUploadStats(null)
    setPendingImagePath(null)
    setFormErrors([])
  }

  const focusForm = () => {
    requestAnimationFrame(() => {
      document
        .getElementById("perfume-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
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
      setPendingImagePath(null)
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

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    setNotice({ tone: "info", message: "Subiendo imagen..." })

    try {
      const uploaded = await uploadPerfumeImage(file)
      const statsMessage = uploaded.optimization
        ? formatUploadStats(uploaded.optimization)
        : null

      setForm((current) => ({
        ...current,
        image: uploaded.publicUrl,
        imagePath: uploaded.path,
      }))
      if (pendingImagePath && pendingImagePath !== uploaded.path) {
        void deletePerfumeImage(pendingImagePath).catch(() => undefined)
      }
      setPendingImagePath(uploaded.path)
      setUploadStats(uploaded.optimization ?? null)
      setNotice({
        tone: "success",
        message: statsMessage
          ? `Imagen subida correctamente. ${statsMessage}.`
          : "Imagen subida correctamente.",
      })
    } catch (uploadError) {
      setNotice({
        tone: "error",
        message:
          uploadError instanceof Error
            ? uploadError.message
            : "No se pudo subir la imagen.",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageRemove = async () => {
    const path = form.imagePath

    if (!form.image) return

    if (path && !window.confirm("¿Quitar esta imagen y eliminarla del storage?")) {
      return
    }

    setRemovingImage(true)
    setNotice({
      tone: "info",
      message: path ? "Eliminando imagen del storage..." : "Quitando URL de imagen...",
    })

    try {
      if (path) await deletePerfumeImage(path)
      setForm((current) => ({
        ...current,
        image: "",
        imagePath: "",
      }))
      if (pendingImagePath === path) setPendingImagePath(null)
      setUploadStats(null)
      setNotice({
        tone: "success",
        message: path
          ? "Imagen eliminada del storage. Guarda el perfume para confirmar el cambio."
          : "URL de imagen quitada. Guarda el perfume para confirmar el cambio.",
      })
    } catch (removeError) {
      setNotice({
        tone: "error",
        message:
          removeError instanceof Error
            ? removeError.message
            : "No se pudo quitar la imagen.",
      })
    } finally {
      setRemovingImage(false)
    }
  }

  const handleDelete = async (id: string) => {
    const perfume = perfumes.find((item) => item.id === id)
    const label = perfume ? `${perfume.brand} ${perfume.name}` : "este perfume"

    if (
      !window.confirm(
        `¿Eliminar permanentemente ${label}? También se eliminará su imagen del storage.`,
      )
    ) {
      return
    }

    setNotice({ tone: "info", message: "Eliminando perfume e imagen..." })
    setDeletingId(id)

    try {
      const deleted = await deletePerfume(id)
      const imagePath =
        deleted.imagePath ?? getPerfumeImageStoragePath(deleted.imageUrl)

      if (imagePath) {
        try {
          await deletePerfumeImage(imagePath)
        } catch (imageDeleteError) {
          setNotice({
            tone: "error",
            message:
              "El perfume se eliminó de la base de datos, pero no fue posible borrar " +
              `su imagen del storage: ${
                imageDeleteError instanceof Error
                  ? imageDeleteError.message
                  : "error desconocido"
              }`,
          })
          if (form.id === id) setForm(emptyPerfumeForm)
          return
        }
      }

      if (form.id === id) setForm(emptyPerfumeForm)
      setNotice({
        tone: "success",
        message: imagePath
          ? "Perfume e imagen eliminados correctamente."
          : "Perfume eliminado correctamente.",
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

  if (!sessionReady || checkingAdmin) {
    return (
      <AdminAccessLayout
        eyebrow="Administración"
        title="Preparando el panel"
        description="Estamos verificando la sesión y cargando el catálogo."
      >
        <div className="flex items-center gap-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
          <LoaderCircle
            aria-hidden="true"
            className="animate-spin text-[#8f334d]"
            size={19}
          />
          Verificando acceso
        </div>
      </AdminAccessLayout>
    )
  }

  if (!session) {
    return (
      <AdminLogin
        email={email}
        password={password}
        error={authError}
        submitting={authenticating}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
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
    <main className="min-h-dvh bg-[#eef0ec] text-slate-950">
      <AdminHeader email={session.user.email} onLogout={handleLogout} />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Perfumes</h1>
            <p className="mt-1 text-sm text-slate-500">
              Consulta y actualiza el inventario publicado.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 sm:gap-7">
            <dl className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-x-7">
              <div>
                <dt className="text-xs font-medium text-slate-500">Total</dt>
                <dd className="mt-0.5 text-lg font-semibold">{perfumes.length}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Activos</dt>
                <dd className="mt-0.5 text-lg font-semibold text-emerald-700">
                  {activeCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Agotados</dt>
                <dd className="mt-0.5 text-lg font-semibold text-red-700">
                  {outOfStockCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Unidades</dt>
                <dd className="mt-0.5 text-lg font-semibold text-slate-700">
                  {stockUnits}
                </dd>
              </div>
            </dl>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#8f334d] px-4 text-sm font-semibold text-white transition hover:bg-[#76283e]"
              type="button"
              onClick={() => {
                resetForm()
                focusForm()
              }}
            >
              <Plus aria-hidden="true" size={18} />
              Nuevo perfume
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1600px] items-start gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        {notice && (
          <div className="xl:col-span-2">
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
          onEdit={(perfume) => {
            setForm(perfumeToForm(perfume))
            setUploadStats(null)
            setPendingImagePath(null)
            setFormErrors([])
            focusForm()
          }}
          onDelete={(id) => void handleDelete(id)}
        />

        <PerfumeForm
          form={form}
          errors={formErrors}
          saving={saving}
          uploadingImage={uploadingImage}
          removingImage={removingImage}
          uploadStats={uploadStats ? formatUploadStats(uploadStats) : null}
          onSubmit={handleSave}
          onReset={resetForm}
          onImageRemove={() => void handleImageRemove()}
          onFieldChange={updateField}
          onImageUpload={(file) => void handleImageUpload(file)}
        />
      </div>
    </main>
  )
}
