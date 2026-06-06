import { lazy, Suspense, useEffect, useState } from "react"
import Layout from "./components/layout/Layout"
import Catalog from "./pages/Catalog"

const Admin = lazy(() => import("./pages/Admin"))
const FlipbookLab = lazy(() => import("./pages/FlipbookLab"))

function getRoute() {
  return window.location.hash.replace(/^#/, "") || "/"
}

function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  if (route === "/admin") {
    return (
      <Suspense
        fallback={
          <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
            Cargando administración...
          </main>
        }
      >
        <Admin />
      </Suspense>
    )
  }

  if (route === "/lab/flipbook") {
    return (
      <Suspense
        fallback={
          <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
            Cargando laboratorio...
          </main>
        }
      >
        <FlipbookLab />
      </Suspense>
    )
  }

  return (
    <Layout>
      <Catalog />
    </Layout>
  )
}

export default App
