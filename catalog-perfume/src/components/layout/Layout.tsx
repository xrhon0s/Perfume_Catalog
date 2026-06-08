import Header from "./Header"
import FilterPanel from "./FilterPanel"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Header />
      <FilterPanel />

      {/* CONTENIDO */}
      <div className="h-[calc(100vh-5rem)] w-screen md:h-[calc(100vh-4rem)]">
        {children}
      </div>
    </div>
  )
}
