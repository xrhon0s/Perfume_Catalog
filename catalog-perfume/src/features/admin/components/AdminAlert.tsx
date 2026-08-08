type AdminAlertProps = {
  message: string
  tone: "success" | "error" | "info"
}

export default function AdminAlert({ message, tone }: AdminAlertProps) {
  const className = [
    "flex items-start gap-2.5 rounded-md border px-4 py-3 text-sm font-medium shadow-sm",
    tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
    tone === "error" && "border-red-200 bg-red-50 text-red-800",
    tone === "info" && "border-slate-200 bg-white text-slate-700",
  ]
    .filter(Boolean)
    .join(" ")

  const Icon =
    tone === "success" ? CheckCircle2 : tone === "error" ? TriangleAlert : Info

  return (
    <div aria-live="polite" className={className} role="status">
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={17} />
      <span>{message}</span>
    </div>
  )
}
import { CheckCircle2, Info, TriangleAlert } from "lucide-react"

