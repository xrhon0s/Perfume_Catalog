// src/data/brandsDb.ts

export type Brand = {
  id: string
  name: string
}

/**
 * Helper interno: convierte un nombre en un id estable tipo "carolina-herrera"
 * - lowerCase
 * - sin acentos (Hermès -> hermes)
 * - sin símbolos raros (’ -> ')
 * - espacios a guiones
 */
function toId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .replace(/[’]/g, "'") // normaliza apostrofe bonito
    .replace(/[^a-z0-9\s-]/g, "") // quita símbolos
    .replace(/\s+/g, "-") // espacios -> guiones
    .replace(/-+/g, "-") // guiones repetidos
}

export const brandsDb: Brand[] = [
  { id: toId("Lattafa"), name: "Lattafa" },
  { id: toId("Attar Collection"), name: "Attar Collection" },
  { id: toId("Armaf"), name: "Armaf" },
  { id: toId("Orientica"), name: "Orientica" },
  { id: toId("Carolina Herrera"), name: "Carolina Herrera" },
  { id: toId("Ariana Grande"), name: "Ariana Grande" },
  { id: toId("Paco Rabanne"), name: "Paco Rabanne" },
  { id: toId("Chanel"), name: "Chanel" },
  { id: toId("Bharara"), name: "Bharara" },
  { id: toId("Lacoste"), name: "Lacoste" },
  { id: toId("Valentino"), name: "Valentino" },
  { id: toId("Al Haramain"), name: "Al Haramain" },
  { id: toId("Versace"), name: "Versace" },
  { id: toId("Parfums de Marly"), name: "Parfums de Marly" },
  { id: toId("Afnan"), name: "Afnan" },
  { id: toId("Dior"), name: "Dior" },
  { id: toId("Jean Paul Gaultier"), name: "Jean Paul Gaultier" },
  { id: toId("Dolce & Gabbana"), name: "Dolce & Gabbana" },
  { id: toId("Lancôme"), name: "Lancôme" },
  { id: toId("Paris Hilton"), name: "Paris Hilton" },
  { id: toId("Montale"), name: "Montale" },
  { id: toId("Ahli"), name: "Ahli" },
  { id: toId("Le Labo"), name: "Le Labo" },
  { id: toId("Polo Ralph Lauren"), name: "Polo Ralph Lauren" },
  { id: toId("Diesel"), name: "Diesel" },
  { id: toId("Giorgio Armani"), name: "Giorgio Armani" },
  { id: toId("Burberry"), name: "Burberry" },
  { id: toId("Calvin Klein"), name: "Calvin Klein" },
  { id: toId("Issey Miyake"), name: "Issey Miyake" },
  { id: toId("Perry Ellis"), name: "Perry Ellis" },
  { id: toId("Victoria’s Secret"), name: "Victoria’s Secret" },
  { id: toId("Montblanc"), name: "Montblanc" },
  { id: toId("Tommy Hilfiger"), name: "Tommy Hilfiger" },
  { id: toId("Xerjoff"), name: "Xerjoff" },
  { id: toId("Lorenzo Pazzaglia"), name: "Lorenzo Pazzaglia" },
  { id: toId("Louis Vuitton"), name: "Louis Vuitton" },
  { id: toId("Game of Spades"), name: "Game of Spades" },
  { id: toId("Nautica"), name: "Nautica" },
  { id: toId("Moschino"), name: "Moschino" },
  { id: toId("Loewe"), name: "Loewe" },
  { id: toId("Hermès"), name: "Hermès" },
  { id: toId("Prada"), name: "Prada" },
  { id: toId("Escada"), name: "Escada" },
  { id: toId("DKNY"), name: "DKNY" },
  { id: toId("Halloween"), name: "Halloween" },
  { id: toId("Marc Jacobs"), name: "Marc Jacobs" },
  { id: toId("Gucci"), name: "Gucci" },
  { id: toId("Cartier"), name: "Cartier" },
  { id: toId("Bond No.9"), name: "Bond No.9" },
  { id: toId("Ilmin"), name: "Ilmin" },
]

// Helpers útiles para UI / filtros
export function getBrands(): Brand[] {
  return [...brandsDb].sort((a, b) => a.name.localeCompare(b.name))
}

export function findBrandById(id: string) {
  return brandsDb.find((b) => b.id === id) ?? null
}
