import type { PropsWithChildren } from "react"
import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Perfume } from "../../data/types"
import { useUIStore } from "../../store/uiStore"
import PerfumeFlipbook from "./PerfumeFlipbook"

const flipbookApi = vi.hoisted(() => ({
  flip: vi.fn(),
  flipNext: vi.fn(),
  flipPrev: vi.fn(),
  turnToPage: vi.fn(),
}))

vi.mock("react-pageflip", async () => {
  const ReactModule = await import("react")

  return {
    default: ReactModule.forwardRef(function MockFlipbook(
      {
        autoSize,
        children,
        className,
      }: PropsWithChildren<{ autoSize?: boolean; className?: string }>,
      ref,
    ) {
      ReactModule.useImperativeHandle(ref, () => ({
        pageFlip: () => flipbookApi,
      }))

      return (
        <div
          className={className}
          data-auto-size={String(autoSize)}
          data-testid="flipbook-shell"
        >
          {children}
        </div>
      )
    }),
  }
})

const perfumes: Perfume[] = Array.from({ length: 60 }, (_, index) => ({
  id: String(index),
  name: `Perfume ${index + 1}`,
  brand: "Éter",
}))

describe("PerfumeFlipbook pagination", () => {
  afterEach(cleanup)

  beforeEach(() => {
    flipbookApi.turnToPage.mockReset()
    useUIStore.setState({
      pageIndex: 0,
      totalPages: 0,
      jumpToPageRequest: null,
    })
  })

  it("salta a la primera hoja del pliego solicitado", async () => {
    render(
      <PerfumeFlipbook items={perfumes} onViewPerfume={() => undefined} />,
    )

    act(() => useUIStore.getState().requestJumpToPage(24))

    await waitFor(() => {
      expect(flipbookApi.turnToPage).toHaveBeenCalledWith(48)
    })
    expect(useUIStore.getState().jumpToPageRequest).toBeNull()
  })

  it("ajusta el libro a la altura disponible del catálogo", () => {
    render(
      <PerfumeFlipbook items={perfumes} onViewPerfume={() => undefined} />,
    )

    const shell = screen.getByTestId("flipbook-shell")

    expect(shell).toHaveAttribute("data-auto-size", "false")
    expect(shell).toHaveClass("h-full", "w-full")
  })

  it("monta únicamente las fichas cercanas a la hoja visible", () => {
    render(
      <PerfumeFlipbook items={perfumes} onViewPerfume={() => undefined} />,
    )

    expect(screen.getByText("Perfume 1")).toBeVisible()
    expect(screen.getByText("Perfume 5")).toBeVisible()
    expect(screen.queryByText("Perfume 6")).not.toBeInTheDocument()
    expect(screen.queryByText("Perfume 60")).not.toBeInTheDocument()
  })
})
