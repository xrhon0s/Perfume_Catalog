import Header from "./Header"
import FilterPanel from "./FilterPanel"
import CartDrawer from "../../features/cart/CartDrawer"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-[#dfe2dc]">
      <Header />
      <FilterPanel />
      <div className="min-h-0 flex-1">{children}</div>
      <CartDrawer />
    </div>
  )
}
