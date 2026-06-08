export type OlfactiveFamily =
  | "Cítrico"
  | "Floral"
  | "Amaderado"
  | "Oriental"
  | "Aromático"
  | "Fougère"
  | "Gourmand"
  | "Acuático"
  | "Chipre"
  | "Cuero"
  | "Ámbar"
  | "Frutal"
  | "Especiado"

export type Concentration = "EDT" | "EDP" | "Parfum" | "Extrait"

export type Gender = "Masculino" | "Femenino" | "Unisex"

export type Perfume = {
  id: string
  name: string
  brand: string
  image?: string

  family?: OlfactiveFamily
  concentration?: Concentration
  gender?: Gender
  year?: number

  notes?: {
    top?: string[]
    heart?: string[]
    base?: string[]
  }

  description?: string
  tags?: string[] // para IA o búsqueda rápida
  isActive?: boolean
}
