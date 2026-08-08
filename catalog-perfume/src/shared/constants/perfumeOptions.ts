import type { Concentration, Gender, OlfactiveFamily } from "../../data/types"

export const OLFACTIVE_FAMILIES = [
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
] as const satisfies readonly OlfactiveFamily[]

export const CONCENTRATIONS = [
  "EDT",
  "EDP",
  "Parfum",
  "Extrait",
] as const satisfies readonly Concentration[]

export const GENDERS = [
  "Masculino",
  "Femenino",
  "Unisex",
] as const satisfies readonly Gender[]

