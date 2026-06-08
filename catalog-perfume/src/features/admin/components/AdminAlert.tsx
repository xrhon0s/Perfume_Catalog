type AdminAlertProps = {
  message: string
  tone: "success" | "error" | "info"
}

export default function AdminAlert({ message, tone }: AdminAlertProps) {
  const className = [
    "rounded-lg border px-4 py-3 text-sm font-medium shadow-sm",
    tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
    tone === "error" && "border-red-200 bg-red-50 text-red-800",
    tone === "info" && "border-slate-200 bg-white text-slate-700",
  ]
    .filter(Boolean)
    .join(" ")

  return <div className={className}>{message}</div>
}

