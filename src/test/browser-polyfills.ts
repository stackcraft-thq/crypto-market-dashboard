// JSDOM has no layout/pointer capture; real browser behavior is verified in Playwright.
Object.defineProperties(HTMLElement.prototype, {
  hasPointerCapture: { configurable: true, value: () => false },
  setPointerCapture: { configurable: true, value: () => {} },
  releasePointerCapture: { configurable: true, value: () => {} },
  scrollIntoView: { configurable: true, value: () => {} },
})

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
