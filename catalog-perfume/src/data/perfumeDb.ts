import type { Perfume } from "./types"


function toId(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function makePerfume(name: string, brand: string, id?: string): Perfume {
  return {
    id: id ?? toId(`${brand}-${name}`),
    name: name.trim(),
    brand: brand.trim(),
  }
}

export const perfumeDb: Perfume[] = [
  {
    id: "1",
    name: "Sauvage",
    brand: "Dior",
    image:
      "https://granaroma.co/wp-content/uploads/2024/05/MFK-Oud-Satin-Mood-EDP-1-70ml-CM70.jpg",
    family: "Aromático",
    concentration: "EDT",
    gender: "Masculino",
    year: 2015,
    notes: {
      top: ["Bergamota"],
      heart: ["Pimienta", "Lavanda"],
      base: ["Ambroxan", "Cedro"],
    },
    tags: ["fresco", "masculino", "versátil"],
  },
  {
    id: "2",
    name: "Bleu de Chanel",
    brand: "Chanel",
    image: "https://disfragancias.com/cdn/shop/products/Bleu-EDT-2.jpg?v=1699805879",
    family: "Amaderado",
    concentration: "EDT",
    gender: "Masculino",
    year: 2010,
    tags: ["elegante", "oficina", "amaderado"],
  },
  {
    id: "3",
    name: "Acqua di Giò",
    brand: "Giorgio Armani",
    image: "https://disfragancias.com/cdn/shop/products/lattafa-fakhar-black-2.jpg?v=1699806280",
    family: "Acuático",
    concentration: "EDT",
    gender: "Masculino",
    year: 1996,
    tags: ["verano", "fresco", "marino"],
  },
  {
    id: "4",
    name: "La Vie Est Belle",
    brand: "Lancôme",
    image:
      "https://granaroma.co/wp-content/uploads/2024/05/MFK-Oud-Satin-Mood-EDP-1-70ml-CM70.jpg",
    family: "Gourmand",
    concentration: "EDP",
    gender: "Femenino",
    year: 2012,
    tags: ["dulce", "gourmand", "popular"],
  },
  // =========================
// Lattafa
// =========================
makePerfume("Bade'e Al Oud Amethyst", "Lattafa"),
makePerfume("Bade’e Al Oud Sublime", "Lattafa"),
makePerfume("Bade’e Al Oud Honor & Glory", "Lattafa"),
makePerfume("Oud for Glory (Bade’e Al Oud)", "Lattafa"),
makePerfume("Noble Bush", "Lattafa"),
makePerfume("Asad Bourbon", "Lattafa"),
makePerfume("Asad", "Lattafa"),
makePerfume("Asad Zanzibar", "Lattafa"),
makePerfume("Yara Candy", "Lattafa"),
makePerfume("Yara Tous", "Lattafa"),
makePerfume("Yara Mois", "Lattafa"),
makePerfume("Yara", "Lattafa"),
makePerfume("Khamrah", "Lattafa"),
makePerfume("Khamrah Qahwa", "Lattafa"),
makePerfume("Khamrah Dunkhan", "Lattafa"),
makePerfume("Eclaire", "Lattafa"),
makePerfume("Emeer", "Lattafa"),
makePerfume("Fakhar Rose", "Lattafa"),
makePerfume("Fakhar Black", "Lattafa"),
makePerfume("Fakhar Extrait", "Lattafa"),
makePerfume("Ajwad Pink to pink", "Lattafa"),
makePerfume("Ajwad", "Lattafa"),
makePerfume("Mayar", "Lattafa"),
makePerfume("Mayar Natural Intense", "Lattafa"),
makePerfume("Her Confession", "Lattafa"),
makePerfume("His Confession", "Lattafa"),
makePerfume("Emaan", "Lattafa"),
makePerfume("Haya", "Lattafa"),
makePerfume("Musamam", "Lattafa"),
makePerfume("Musamam White Intense", "Lattafa"),
makePerfume("Shaheen Silver", "Lattafa"),
makePerfume("Shaheen Gold", "Lattafa"),
makePerfume("Maahir", "Lattafa"),
makePerfume("Maahir Black Edition", "Lattafa"),
makePerfume("Maahir Legacy", "Lattafa"),
makePerfume("Qaed al Fursan", "Lattafa"),
makePerfume("Hayaati Florence", "Lattafa"),
makePerfume("Hayaati Al Maleky", "Lattafa"),
makePerfume("Hayaati", "Lattafa"),
makePerfume("Hayaati Gold Elixir", "Lattafa"),
makePerfume("Oud Mood", "Lattafa"),
makePerfume("Ameerat al Arab prive Rose", "Lattafa"),

// =========================
// Attar Collection
// =========================
makePerfume("Hayati", "Attar Collection"),
// =========================
// Armaf
// =========================
makePerfume("Odyssey Mandarin Sky", "Armaf"),
makePerfume("Odyssey Candee", "Armaf"),
makePerfume("Odyssey Spectra Rainbow Edition", "Armaf"),
makePerfume("Odyssey Dubia Chocolat", "Armaf"),
makePerfume("Odyssey Limoni", "Armaf"),
makePerfume("Odyssey Mandarin Sky Elixir", "Armaf"),
makePerfume("Odyssey Artisto", "Armaf"),
makePerfume("Odyssey Wild One", "Armaf"),
makePerfume("Odyssey Homme", "Armaf"),
makePerfume("Odyssey Tryant", "Armaf"),
makePerfume("Odyssey Mega", "Armaf"),
makePerfume("Odyssey Marshmallow", "Armaf"),
makePerfume("Odyssey Go Mango", "Armaf"),
makePerfume("Odyssey Spectra Blu Edition", "Armaf"),
makePerfume("Odyssey Eau de Montagne", "Armaf"),
makePerfume("Club de Nuit Intense Man", "Armaf"),
makePerfume("Club de Nuit Untold", "Armaf"),
makePerfume("Club de Nuit Urban Man Elixir", "Armaf"),
makePerfume("Club de Nuit Milestone", "Armaf"),
makePerfume("Club de Nuit Maleka", "Armaf"),
makePerfume("Club de Nuit Lionheart", "Armaf"),
makePerfume("Club de Nuit Woman", "Armaf"),
makePerfume("Yum Yum", "Armaf"),
makePerfume("Bliss Island", "Armaf"),

// =========================
// Orientica
// =========================
makePerfume("Amber Rouge", "Orientica"),
makePerfume("Velvet Gold", "Orientica"),
makePerfume("Royal Amber", "Orientica"),
makePerfume("Dania", "Orientica"),
makePerfume("Amber noir", "Orientica"),
makePerfume("Royal bleu", "Orientica"),
makePerfume("Azure fantasy", "Orientica"),
makePerfume("Oud saffron", "Orientica"),

// =========================
// Hawas
// =========================

makePerfume("Rasasi Hawas for Him", "Hawas"),
makePerfume("Rasasi Hawas Fire", "Hawas"),
makePerfume("Rasasi Hawas Ice", "Hawas"),
makePerfume("Rasasi Hawas Elixir", "Hawas"),
makePerfume("Rasasi Hawas Black", "Hawas"),
makePerfume("Rasasi Hawas for Her", "Hawas"),

// =========================
// Carolina Herrera
// =========================
makePerfume("212 Men NYC", "Carolina Herrera"),
makePerfume("212 NYC", "Carolina Herrera"),
makePerfume("212 VIP Black", "Carolina Herrera"),
makePerfume("212 VIP Rosé", "Carolina Herrera"),
makePerfume("212 VIP", "Carolina Herrera"),
makePerfume("212 Sexy men", "Carolina Herrera"),
makePerfume("212 VIPmen", "Carolina Herrera"),
makePerfume("212 Sexy", "Carolina Herrera"),
makePerfume("212 Men Aqua", "Carolina Herrera"),
makePerfume("212 VIP Wild Party", "Carolina Herrera"),
makePerfume("212 VIP Men Wild Party", "Carolina Herrera"),
makePerfume("212 VIP Men Club Edition", "Carolina Herrera"),
makePerfume("212 VIP Rosé Red", "Carolina Herrera"),
makePerfume("212 VIP Black Red", "Carolina Herrera"),
makePerfume("212 VIP Men Wins", "Carolina Herrera"),
makePerfume("212 VIP Wins", "Carolina Herrera"),
makePerfume("212 Men Heroes Nyc", "Carolina Herrera"),
makePerfume("212 Men Heroes Forever Young", "Carolina Herrera"),
makePerfume("212 Women Heroes forever young", "Carolina Herrera"),
makePerfume("Good Girl", "Carolina Herrera"),
makePerfume("Good Girl Légère", "Carolina Herrera"),
makePerfume("Good Girl Blush", "Carolina Herrera"),
makePerfume("Good Girl Dot Drama", "Carolina Herrera"),
makePerfume("Good Girl Very Good Girl", "Carolina Herrera"),
makePerfume("Good Girl Fantastic Pink", "Carolina Herrera"),
makePerfume("Good Girl Dazzling Garden", "Carolina Herrera"),
makePerfume("Good Girl Gold Fantasy", "Carolina Herrera"),
makePerfume("Good Girl Suprême", "Carolina Herrera"),
makePerfume("Good Girl collector edition", "Carolina Herrera"),
makePerfume("Good Girl Glorious Gold Collector Edition", "Carolina Herrera"),
makePerfume("Good Girl Sparkling Ice", "Carolina Herrera"),
makePerfume("Good Girl Blush Elixir Eau de Parfum", "Carolina Herrera"),
makePerfume("Carolina Herrera", "Carolina Herrera"),
makePerfume("Herrera For Men", "Carolina Herrera"),
makePerfume("CH", "Carolina Herrera"),
makePerfume("CH Men", "Carolina Herrera"),
makePerfume("CH Pasión for Her", "Carolina Herrera"),
makePerfume("CH Pasión for Him", "Carolina Herrera"),
makePerfume("CH L'Eau 2017", "Carolina Herrera"),
makePerfume("Bad Boy", "Carolina Herrera"),
makePerfume("Bad Boy Superstars Collector Edition 2021", "Carolina Herrera"),
makePerfume("Bad Boy Le Parfum", "Carolina Herrera"),
makePerfume("Bad Boy Dazzling Garden", "Carolina Herrera"),
makePerfume("Bad Boy White", "Carolina Herrera"),

// =========================
// Ariana Grande
// =========================
makePerfume("Cloud", "Ariana Grande"),
makePerfume("Cloud 2.0", "Ariana Grande", "ariana-grande-cloud-2-0"),
makePerfume("Cloud Pink", "Ariana Grande"),
makePerfume("Thank U, Next", "Ariana Grande"),
makePerfume("Cloud Intense", "Ariana Grande"),
makePerfume("Thank U, Next 2.0", "Ariana Grande", "ariana-grande-thank-u-next-2-0"),
makePerfume("R.E.M", "Ariana Grande"),
makePerfume("Sweet Like Candy", "Ariana Grande"),
makePerfume("Ari", "Ariana Grande"),
makePerfume("Moonlight", "Ariana Grande"),
makePerfume("Sweet Like Candy Limited Edition", "Ariana Grande"),
makePerfume("Mod Vanilla", "Ariana Grande"),
makePerfume("Mod Blush", "Ariana Grande"),

// =========================
// Paco Rabanne
// =========================
makePerfume("1 Million", "Paco Rabanne"),
makePerfume("1 Million Lucky", "Paco Rabanne"),
makePerfume("1 Million Parfum", "Paco Rabanne"),
makePerfume("1 Million Privé", "Paco Rabanne"),
makePerfume("1 Million Elixir", "Paco Rabanne"),
makePerfume("1 Million Royal", "Paco Rabanne"),
makePerfume("1 Million Golden Oud", "Paco Rabanne"),
makePerfume("Lady Million", "Paco Rabanne"),
makePerfume("Lady Million Empire", "Paco Rabanne"),
makePerfume("Lady Million Lucky", "Paco Rabanne"),
makePerfume("Lady Million Prive", "Paco Rabanne"),
makePerfume("Lady Million Fabulous", "Paco Rabanne"),
makePerfume("Lady Million Royal", "Paco Rabanne"),
makePerfume("Million Gold", "Paco Rabanne"),
makePerfume("Invictus", "Paco Rabanne"),
makePerfume("Invictus Aqua", "Paco Rabanne"),
makePerfume("Invictus Victory Elixir", "Paco Rabanne"),
makePerfume("Invictus Legend", "Paco Rabanne"),
makePerfume("Invictus Intense", "Paco Rabanne"),
makePerfume("Invictus Victory", "Paco Rabanne"),
makePerfume("Invictus Acqua 2018", "Paco Rabanne"),
makePerfume("Invictus Platinum", "Paco Rabanne"),
makePerfume("Olimpea", "Paco Rabanne"),
makePerfume("Olimpea Blossom", "Paco Rabanne"),
makePerfume("Olimpea Intense", "Paco Rabanne"),
makePerfume("Olimpea Solar", "Paco Rabanne"),
makePerfume("Phantom Parfum", "Paco Rabanne"),
makePerfume("Phantom", "Paco Rabanne"),
makePerfume("Phantom Legion", "Paco Rabanne"),
makePerfume("Fame", "Paco Rabanne"),
makePerfume("Fame Blooming Pink", "Paco Rabanne"),
makePerfume("Pure XS", "Paco Rabanne"),
makePerfume("Black XS", "Paco Rabanne"),
makePerfume("Black XS L'aphrodisiaque for men", "Paco Rabanne"),
makePerfume("Pure XS For Her", "Paco Rabanne"),
makePerfume("Black XS for Her", "Paco Rabanne"),

// =========================
// Chanel
// =========================
makePerfume("Chance Eau Fraiche", "Chanel"),
makePerfume("Chance Eau de Parfum", "Chanel"),
makePerfume("Chance Eau Tendre", "Chanel"),
makePerfume("Coco Mademoiselle", "Chanel"),
makePerfume("Chanel No 5 Eau de Parfum Chanel", "Chanel"),
makePerfume("Coco Noir", "Chanel"),
makePerfume("Bleu de Chanel", "Chanel"),
makePerfume("Allure Homme Sport", "Chanel"),

// =========================
// Bharara
// =========================
makePerfume("Bharara King", "Bharara"),
makePerfume("Bharara Niche", "Bharara"),
makePerfume("Bharara Onyx", "Bharara"),
makePerfume("Bharara Rose", "Bharara"),
makePerfume("Bharara Scarlett", "Bharara"),
makePerfume("Bharara Blue", "Bharara"),
makePerfume("Bharara KIng Parfum", "Bharara"),
makePerfume("Bharara Chocolate", "Bharara"),
makePerfume("Bharara Queen", "Bharara"),
makePerfume("Bharara Viking Dubai", "Bharara"),
makePerfume("Bharara Viking Cairo", "Bharara"),
makePerfume("Bharara Viking Beirut", "Bharara"),
makePerfume("Bharara Viking Rio", "Bharara"),

// =========================
// Lacoste
// =========================
makePerfume("Lacoste L.12.12 White", "Lacoste"),
makePerfume("Lacoste L.12.12 Noir", "Lacoste"),
makePerfume("Lacoste L.12.12 Rouge", "Lacoste"),
makePerfume("Lacoste L.12.12 Green", "Lacoste"),
makePerfume("Lacoste L.12.12 Pour Lui Magetic", "Lacoste"),
makePerfume("Lacoste L.12.12 Pour Lui French Panache", "Lacoste"),
makePerfume("Lacoste L.12.12 Eau Fraiche", "Lacoste"),
makePerfume("Lacoste Style in Play", "Lacoste"),
makePerfume("Lacoste Essential Collector", "Lacoste"),
makePerfume("Lacoste L.12.12 Yellow (Janue)", "Lacoste"),
makePerfume("Lacoste L.12.12 Pour Elle Sparkling", "Lacoste"),
makePerfume("Lacoste L.12.12 Pour Elle Natural", "Lacoste"),
makePerfume("Lacoste L.12.12 pour Elle Magnetic", "Lacoste"),
makePerfume("Lacoste L.12.12 Sparkling Collector Edition Pour Femme x Jeremyville", "Lacoste"),
makePerfume("Lacoste L.12.12 Rose for Her", "Lacoste"),
makePerfume("Lacoste L.12.12 Pour Elle French Panache", "Lacoste"),
makePerfume("Lacoste L.12.12 Pour Elle Elegant", "Lacoste"),
makePerfume("Lacoste Dream of Pink", "Lacoste"),
makePerfume("Eau de Lacoste Sensuelle", "Lacoste"),

// =========================
// Valentino
// =========================
makePerfume("Valentino Uomo Born in Roma", "Valentino"),
makePerfume("Born in Roma The gold Uomo", "Valentino"),
makePerfume("Valentino Uomo Intense", "Valentino"),
makePerfume("Valentino Donna Born in Roma", "Valentino"),
makePerfume("Valentino Donna Born in Roma Pink PP", "Valentino"),
makePerfume("Valentino Donna Born in Roma Yellow Dream", "Valentino"),
makePerfume("Valentino Uomo Green Stravaganza", "Valentino"),

// =========================
// Al Haramain
// =========================
makePerfume("Amber Oud Gold Edition", "Al Haramain"),
makePerfume("Amber Oud Ruby", "Al Haramain"),
makePerfume("Amber Oud Aqua Dubai", "Al Haramain"),
makePerfume("Amber Oud Ultra Violet", "Al Haramain"),
makePerfume("Amber Oud Bleu Edition", "Al Haramain"),
makePerfume("Amber Oud Private Edition", "Al Haramain"),

// =========================
// Hugo Boss
// =========================
makePerfume("Hugo Woman Eau de Parfum", "Hugo Boss"),
makePerfume("Boss The Scent Pure Accord For Her", "Hugo Boss"),
makePerfume("Deep Red", "Hugo Boss"),
makePerfume("Hugo Xx Eau de Toilette", "Hugo Boss"),
makePerfume("Femme", "Hugo Boss"),
makePerfume("Boss Bottled 20th Anniversary Edition", "Hugo Boss"),
makePerfume("Hugo Boss Unlimited", "Hugo Boss"),
makePerfume("Boss Bottled Infinite", "Hugo Boss"),
makePerfume("Boss Bottled Tonic", "Hugo Boss"),
makePerfume("Boss Bottled Parfum", "Hugo Boss"),
makePerfume("Boss Bottled Sport", "Hugo Boss"),
makePerfume("Hugo Man Hugo Boss", "Hugo Boss"),
makePerfume("Hugo Red", "Hugo Boss"),
makePerfume("Hugo Just Different", "Hugo Boss"),
makePerfume("Hugo Iced", "Hugo Boss"),
makePerfume("boss the scent", "Hugo Boss"),
makePerfume("Hugo XY Boss", "Hugo Boss"),
makePerfume("Boss Orange for Men", "Hugo Boss"),
makePerfume("Hugo Dark Blue", "Hugo Boss"),
makePerfume("Boss in Motion", "Hugo Boss"),
makePerfume("Hugo Energise", "Hugo Boss"),

// =========================
// Versace
// =========================
makePerfume("Bright Crystal", "Versace"),
  makePerfume("Yellow Diamond", "Versace"),
  makePerfume("Versace Crystal Noir", "Versace"),
  makePerfume("Bright Crystal Absolu", "Versace"),
  makePerfume("Versense", "Versace"),
  makePerfume("Eros Pour Femme", "Versace"),
  makePerfume("Versace Pour Femme Dylan Blue", "Versace"),
  makePerfume("Versace Pour Femme Dylan Turquoise", "Versace"),
  makePerfume("Versace Pour Femme Dylan Purple", "Versace"),
  makePerfume("Eros", "Versace"),
  makePerfume("Eros Energy", "Versace"),
  makePerfume("Eros Flame", "Versace"),
  makePerfume("Oud Noir", "Versace"),
  makePerfume("Dylan Blue", "Versace"),
  makePerfume("Versace Pour Homme", "Versace"),

  // =========================
// Parfums de Marly
// =========================
  makePerfume("Layton", "Parfums de Marly"),
  makePerfume("Godolphin", "Parfums de Marly"),
  makePerfume("Pegasus", "Parfums de Marly"),
  makePerfume("Pegasus Exclusive", "Parfums de Marly"),
  makePerfume("Kalan", "Parfums de Marly"),
  makePerfume("Delina Exclusive", "Parfums de Marly"),

  // =========================
// Afnan
// =========================
  makePerfume("9PM", "Afnan"),
  makePerfume("9AM Dive", "Afnan"),
  makePerfume("9AM pour femme", "Afnan"),
  makePerfume("9PM pour Femme", "Afnan"),
  makePerfume("9PM Rebel", "Afnan"),
  makePerfume("9AM", "Afnan"),
  makePerfume("9PM Elixir", "Afnan"),

  // =========================
// Dior
// =========================
  makePerfume("Miss Dior", "Dior"),
  makePerfume("J'adore", "Dior"),
  makePerfume("J'adore Parfum deau", "Dior"),
  makePerfume("Joy by Dior", "Dior"),
  makePerfume("Hypnotic Poison", "Dior"),
  makePerfume("Sauvage", "Dior"),
  makePerfume("Sauvage Elixir", "Dior"),
  makePerfume("Farenheit", "Dior"),

  // =========================
// Jean Paul Gaultier
// =========================
  makePerfume("Scandal", "Jean Paul Gaultier"),
  makePerfume("Scandal Pour Homme", "Jean Paul Gaultier"),
  makePerfume("Scandal Pour Homme Absolu", "Jean Paul Gaultier"),
  makePerfume("Scandal Pour Homme Le Parfum", "Jean Paul Gaultier"),
  makePerfume("Scandal Absolu", "Jean Paul Gaultier"),
  makePerfume("Le Male", "Jean Paul Gaultier"),
  makePerfume("Classique", "Jean Paul Gaultier"),
  makePerfume("Le Male Le Parfum", "Jean Paul Gaultier"),
  makePerfume("La Belle Paradise Garden", "Jean Paul Gaultier"),
  makePerfume("Le Beau Le Parfum", "Jean Paul Gaultier"),
  makePerfume("La Belle", "Jean Paul Gaultier"),
  makePerfume("Le Beau", "Jean Paul Gaultier"),
  makePerfume("Le Male Elixir", "Jean Paul Gaultier"),
  makePerfume("Le Beau Paradise Garden", "Jean Paul Gaultier"),
  makePerfume("Gaultier Divine", "Jean Paul Gaultier"),

  // =========================
// Dolce & Gabbana
// =========================
  makePerfume("K by Dolce & Gabbana", "Dolce & Gabbana"),
  makePerfume("Q by Dolce & Gabbana", "Dolce & Gabbana"),
  makePerfume("K by Dolce & Gabbana Eau de Parfum", "Dolce & Gabbana"),
  makePerfume("Light Blue", "Dolce & Gabbana"),
  makePerfume("Light Blue pour Homme", "Dolce & Gabbana"),
  makePerfume("Light Blue Italian Zest", "Dolce & Gabbana"),
  makePerfume("Light Blue Italian Zest Pour Homme", "Dolce & Gabbana"),
  makePerfume("Light Blue Love Is Love Pour Femme", "Dolce & Gabbana"),
  makePerfume("Light Blue Love Is Love Pour Homme", "Dolce & Gabbana"),
  makePerfume("Light Blue Forever", "Dolce & Gabbana"),
  makePerfume("Light Blue Forever pour Homme", "Dolce & Gabbana"),
  makePerfume("Light Blue Summer Vibes", "Dolce & Gabbana"),
  makePerfume("Light Blue Pour Homme Summer Vibes", "Dolce & Gabbana"),
  makePerfume("Light Blue Italian Love", "Dolce & Gabbana"),
  makePerfume("Italian Blue Pour Homme", "Dolce & Gabbana"),
  makePerfume("Dolce&Gabbana Pour Homme Intenso", "Dolce & Gabbana"),
  makePerfume("The One", "Dolce & Gabbana"),
  makePerfume("The One for Men", "Dolce & Gabbana"),
  makePerfume("The Only One", "Dolce & Gabbana"),

  // =========================
// Lancôme
// =========================
  makePerfume("Idôle", "Lancôme"),
  makePerfume("La Vie Est Belle", "Lancôme"),
  makePerfume("La Vie Est Belle Intensément", "Lancôme"),
  makePerfume("La Vie est Belle L'Éclat", "Lancôme"),
  makePerfume("La Vie Est Belle Iris Absolu", "Lancôme"),
  makePerfume("La Vie Est Belle Soleil Cristal", "Lancôme"),
  makePerfume("La Vie est Belle L'Elixir", "Lancôme"),
  makePerfume("Oui La Vie est Belle", "Lancôme"),
  makePerfume("Trésor", "Lancôme"),
  makePerfume("Miracle", "Lancôme"),

  // =========================
// Paris Hilton
// =========================
  makePerfume("Can Can Paris", "Paris Hilton"),
  makePerfume("Can Can Burlesque", "Paris Hilton"),
  makePerfume("Dazzle Paris", "Paris Hilton"),
  makePerfume("Paris Hilton", "Paris Hilton"),
  makePerfume("Heiress", "Paris Hilton"),
  makePerfume("Gold Rush", "Paris Hilton"),
  makePerfume("Rosé Rush", "Paris Hilton"),

  // =========================
// Montale
// =========================
  makePerfume("Starry Nights", "Montale"),
  makePerfume("Intense Cafe", "Montale"),
  makePerfume("Arabians Tonka", "Montale"),
  makePerfume("Arabians", "Montale"),
  makePerfume("Roses Musk", "Montale"),
  makePerfume("Wood & Spices", "Montale"),
  makePerfume("Bengal Oud", "Montale"),
  makePerfume("Aoud Lagoon", "Montale"),

  // =========================
// Ahli
// =========================
  makePerfume("Ahli Vega", "Ahli"),
  makePerfume("Ahli Corvus", "Ahli"),
  makePerfume("Ahli Karpos", "Ahli"),
  makePerfume("Ahli SBQ", "Ahli"),
  makePerfume("Ahli Virgo", "Ahli"),
  makePerfume("Ahli Ursa", "Ahli"),
  makePerfume("Ahli Canes", "Ahli"),

// =========================
// Le Labo
// =========================
makePerfume("Santal 33", "Le Labo"),
makePerfume("Bergamote 22", "Le Labo"),
makePerfume("Stallion 53", "Le Labo"),

// =========================
// Polo Ralph Lauren
// =========================
makePerfume("Polo Blue", "Polo Ralph Lauren"),
makePerfume("Polo Red", "Polo Ralph Lauren"),
makePerfume("Polo Black", "Polo Ralph Lauren"),
makePerfume("Polo Sport", "Polo Ralph Lauren"),
makePerfume("Ralph", "Polo Ralph Lauren"),
makePerfume("Big Pony 2", "Polo Ralph Lauren"),

// =========================
// Diesel
// =========================
makePerfume("Only The Brave", "Diesel"),
makePerfume("Spirit Of The Brave", "Diesel"),
makePerfume("Plus Plus Masculine", "Diesel"),

// =========================
// Giorgio Armani
// =========================
makePerfume("Acqua di Giò", "Giorgio Armani"),
makePerfume("Acqua di Giò Profondo", "Giorgio Armani"),
makePerfume("Acqua di Giò Profumo", "Giorgio Armani"),
makePerfume("Acqua di Giò Absolu", "Giorgio Armani"),
makePerfume("Emporio Armani Stronger with You", "Giorgio Armani"),
makePerfume("Stronger With You Intensely", "Giorgio Armani"),
makePerfume("Acqua de Gioia", "Giorgio Armani"),
makePerfume("Sì Fiori", "Giorgio Armani"),
makePerfume("Armani Code", "Giorgio Armani"),
makePerfume("Armani Code Eau de Parfum", "Giorgio Armani"),
makePerfume("Armani Code Profumo", "Giorgio Armani"),
makePerfume("Sì Passione", "Giorgio Armani"),

// =========================
// Burberry
// =========================
makePerfume("Burberry Woman", "Burberry"),
makePerfume("Mr. Burberry Black", "Burberry"),
makePerfume("Her", "Burberry"),
makePerfume("Her Elixir de Parfum", "Burberry"),
makePerfume("Burberry Hero", "Burberry"),
makePerfume("Her Eau de Toilette", "Burberry"),

// =========================
// Calvin Klein
// =========================
makePerfume("CK One", "Calvin Klein"),
makePerfume("CK be", "Calvin Klein"),
makePerfume("CK One Shock For Her", "Calvin Klein"),
makePerfume("CK One Shock For Him", "Calvin Klein"),
makePerfume("CK IN2U for Her", "Calvin Klein"),
makePerfume("CK IN2U for Him", "Calvin Klein"),
makePerfume("CK Everyone Eau de Parfum", "Calvin Klein"),
makePerfume("Eternity For Men", "Calvin Klein"),
makePerfume("Eternity", "Calvin Klein"),
makePerfume("Euphoria Men", "Calvin Klein"),
makePerfume("Euphoria", "Calvin Klein"),

// =========================
// Issey Miyake
// =========================
makePerfume("L'eau d'Issey pour femme", "Issey Miyake"),
makePerfume("L'eau d'Issey pour homme", "Issey Miyake"),
makePerfume("Nuit D'Issey", "Issey Miyake"),
makePerfume("L'eau d'Issey pour homme Intense", "Issey Miyake"),

// =========================
// Perry Ellis
// =========================
makePerfume("Perry Ellis 360°", "Perry Ellis"),
makePerfume("Perry Ellis 360° Purple", "Perry Ellis"),
makePerfume("Perry Ellis 360° Coral", "Perry Ellis"),
makePerfume("Perry Ellis 360° Red for Men", "Perry Ellis"),
makePerfume("Perry Ellis Black for Men", "Perry Ellis"),
makePerfume("Perry Ellis 360° for Men", "Perry Ellis"),
makePerfume("Perry Ellis 360° Red for Woman", "Perry Ellis"),

// =========================
// Victoria’s Secret
// =========================
makePerfume("Bombshell", "Victoria’s Secret"),
makePerfume("Bombshell New York", "Victoria’s Secret"),
makePerfume("Bombshell Seduction Eau de Parfum", "Victoria’s Secret"),
makePerfume("Bombshell Intense", "Victoria’s Secret"),
makePerfume("Bombshell Paradise", "Victoria’s Secret"),
makePerfume("Angel Gold", "Victoria’s Secret"),
makePerfume("Tease Rebel", "Victoria’s Secret"),
makePerfume("Victoria’s Secret Angel", "Victoria’s Secret"),

// =========================
// Montblanc
// =========================
makePerfume("Legend", "Montblanc"),
makePerfume("Legend Spirit", "Montblanc"),
makePerfume("Legend Night", "Montblanc"),
makePerfume("Legend Red", "Montblanc"),
makePerfume("Individuel", "Montblanc"),
makePerfume("Emblem", "Montblanc"),
makePerfume("Explorer", "Montblanc"),
makePerfume("Starwalker", "Montblanc"),
makePerfume("Signature", "Montblanc"),
makePerfume("Individuelle Femme", "Montblanc"),
makePerfume("Lady Emblem", "Montblanc"),

// =========================
// Tommy Hilfiger
// =========================
makePerfume("Tommy Girl", "Tommy Hilfiger"),
makePerfume("Tommy", "Tommy Hilfiger"),
makePerfume("Tommy Girl Now", "Tommy Hilfiger"),
makePerfume("Tommy Now", "Tommy Hilfiger"),
makePerfume("Impact", "Tommy Hilfiger"),

// =========================
// Xerjoff
// =========================
makePerfume("Erba Pura", "Xerjoff"),
makePerfume("Nero 70", "Xerjoff"),
makePerfume("Accento", "Xerjoff"),
makePerfume("Alexandria II", "Xerjoff"),
makePerfume("Naxos", "Xerjoff"),

// =========================
// Lorenzo Pazzaglia
// =========================
makePerfume("Summer Hammer", "Lorenzo Pazzaglia"),
makePerfume("Carbonara", "Lorenzo Pazzaglia"),
makePerfume("Sun-Gria", "Lorenzo Pazzaglia"),
makePerfume("Sex Sea", "Lorenzo Pazzaglia"),
makePerfume("Pax", "Lorenzo Pazzaglia"),

// =========================
// Louis Vuitton
// =========================
makePerfume("Ombre Nomade", "Louis Vuitton"),
makePerfume("California Dream", "Louis Vuitton"),
makePerfume("Apogée", "Louis Vuitton"),
makePerfume("Imagination", "Louis Vuitton"),
makePerfume("Rose des Venis", "Louis Vuitton"),
makePerfume("Les sables roses", "Louis Vuitton"),
makePerfume("L'Immensite", "Louis Vuitton"),
makePerfume("City of Stars", "Louis Vuitton"),

// =========================
// Game of Spades
// =========================
makePerfume("Full House", "Game of Spades"),
makePerfume("Rouge", "Game of Spades"),
makePerfume("Bid", "Game of Spades"),
makePerfume("WildCard", "Game of Spades"),
makePerfume("Royale", "Game of Spades"),

// =========================
// Nautica
// =========================
makePerfume("Nautica Voyage", "Nautica"),
makePerfume("Nautica Classic", "Nautica"),

// =========================
// Moschino
// =========================
makePerfume("Toy Boy", "Moschino"),
makePerfume("Toy 2 Bubble Gum", "Moschino"),
makePerfume("Toy 2", "Moschino"),
makePerfume("Toy 2 Pearl", "Moschino"),
makePerfume("Moschino Funny!", "Moschino"),
makePerfume("Cheap & Chic I Love Love", "Moschino"),
makePerfume("So Real Cheap & Chic", "Moschino"),
makePerfume("Cheap & Chic Chic Petals", "Moschino"),
makePerfume("Pink Fresh Couture", "Moschino"),
makePerfume("Fresh Couture", "Moschino"),
makePerfume("Gold Fresh Couture", "Moschino"),

// =========================
// Loewe
// =========================
makePerfume("Solo Loewe", "Loewe"),
makePerfume("Loewe Esencia", "Loewe"),

// =========================
// Hermès
// =========================
makePerfume("Terre D'Hermes Eau Intense Vetiver", "Hermès"),

// =========================
// Prada
// =========================
makePerfume("Prada Paradoxe Virtual Flower", "Prada"),

// =========================
// Escada
// =========================
makePerfume("Sorbetto Rosso Escada", "Escada"),

// =========================
// DKNY
// =========================
makePerfume("DKNY Be Delicious Donna Karan", "DKNY"),

// =========================
// Halloween
// =========================
makePerfume("Halloween Halloween", "Halloween"),

// =========================
// Marc Jacobs
// =========================
makePerfume("Daisy Eau So Fresh", "Marc Jacobs"),
makePerfume("Daisy Eau So Fresh Skies", "Marc Jacobs"),
makePerfume("Daisy Eau So Fresh Pop", "Marc Jacobs"),
makePerfume("Decadence", "Marc Jacobs"),

// =========================
// Gucci
// =========================
makePerfume("Gucci Bamboo", "Gucci"),
makePerfume("Gucci Bloom", "Gucci"),
makePerfume("Gucci Guilty", "Gucci"),

// =========================
// Cartier
// =========================
makePerfume("Eau de Cartier", "Cartier"),
makePerfume("Santos de Cartier", "Cartier"),
makePerfume("Declaration Cartier", "Cartier"),
makePerfume("Declaration Essence", "Cartier"),
makePerfume("Pasha de Cartier Edition Noire Cartier", "Cartier"),
makePerfume("La panthere parfum", "Cartier"),

// =========================
// Bond No.9
// =========================
makePerfume("Hamptons Bond No 9", "Bond No.9"),
makePerfume("Nolita Bond No 9", "Bond No.9"),
makePerfume("Bleecker Street Bond No 9", "Bond No.9"),
makePerfume("Chinatown Bond No 9", "Bond No.9"),
makePerfume("New York Nights Bond No 9", "Bond No.9"),
makePerfume("Wall Street Bond No 9", "Bond No.9"),
makePerfume("New York Amber Bond No 9", "Bond No.9"),
makePerfume("Brooklyn Bond No 9", "Bond No.9"),
makePerfume("New Bond St. Bond No 9", "Bond No.9"),
makePerfume("I Love New York for Marriage Equality", "Bond No.9"),
makePerfume("I Love New York for All", "Bond No.9"),
makePerfume("The Scent Of Peace Bond No 9", "Bond No.9"),


]
