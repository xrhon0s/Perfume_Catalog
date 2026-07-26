import type { PerfumeFormState } from "./perfumeForm"

export const currentCatalogYear = new Date().getFullYear()

export function validatePerfumeForm(form: PerfumeFormState) {
  const errors: string[] = []
  const year = form.year ? Number(form.year) : undefined
  const sizeMl = Number(form.sizeMl)
  const salePrice = Number(form.salePrice)
  const stockQuantity = Number(form.stockQuantity)

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

  if (form.year && (!year || year < 1900 || year > currentCatalogYear + 1)) {
    errors.push(`El año debe estar entre 1900 y ${currentCatalogYear + 1}.`)
  }

  if (
    !form.topNotes.trim() &&
    !form.heartNotes.trim() &&
    !form.baseNotes.trim()
  ) {
    errors.push("Agrega al menos una nota olfativa.")
  }

  if (!Number.isInteger(sizeMl) || sizeMl <= 0) {
    errors.push("El tamaño debe ser un número entero mayor que cero.")
  }

  if (form.salePrice.trim() === "" || !Number.isFinite(salePrice) || salePrice < 0) {
    errors.push("El precio de venta debe ser cero o mayor.")
  }

  if (
    form.stockQuantity.trim() === "" ||
    !Number.isInteger(stockQuantity) ||
    stockQuantity < 0
  ) {
    errors.push("Las existencias deben ser un número entero igual o mayor que cero.")
  }

  return errors
}
