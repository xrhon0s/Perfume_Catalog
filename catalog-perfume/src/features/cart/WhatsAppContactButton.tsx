import { MessageCircle } from "lucide-react"
import { createWhatsAppUrl } from "./whatsapp"

const catalogContactMessage =
  "Hola, quisiera recibir asesoría sobre el catálogo de perfumes de Éter."

export default function WhatsAppContactButton({
  className,
}: {
  className: string
}) {
  const businessWhatsApp =
    (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? ""
  const url = createWhatsAppUrl(businessWhatsApp, catalogContactMessage)

  if (!url) return null

  return (
    <a
      aria-label="Hablar por WhatsApp"
      className={`shrink-0 place-items-center rounded-md bg-[#25d366] text-[#102417] transition hover:bg-[#35df76] ${className}`}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
      title="Hablar por WhatsApp"
    >
      <MessageCircle aria-hidden="true" size={18} />
    </a>
  )
}
