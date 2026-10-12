import { expect, test } from '@playwright/test'
import { testCoins } from '../src/test/fixtures/coins'
import AxeBuilder from '@axe-core/playwright'
import { SORT_OPTIONS } from '../src/features/market/types/sort'

// Expanded synthetic dataset exists only inside the intercepted browser test.
const coins = Array.from({ length: 20 }, (_, index) => ({
  ...testCoins[index % testCoins.length]!,
  id: `${testCoins[index % testCoins.length]!.id}-${index}`,
  name: index < 3 ? testCoins[index]!.name : `${testCoins[index % testCoins.length]!.name} ${index + 1}`,
  market_cap_rank: index + 1,
}))

test.beforeEach(async ({ page }) => {
  await page.route('https://api.coingecko.com/**', (route) => route.fulfill({ json: coins }))
})

for (const [label, width, columns] of [['mobile', 390, 1], ['tablet', 820, 2], ['desktop-small', 1100, 3], ['desktop', 1440, 4]] as const) {
  test(`${label}: responsive layout, both themes, no overflow`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.getByRole('article')).toHaveCount(20)
    const gridColumns = await page.locator('.coin-grid').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length)
    expect(gridColumns).toBe(columns)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`${label}-light.png`), fullPage: true })
    await page.getByRole('button', { name: 'Switch to dark theme' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.screenshot({ path: testInfo.outputPath(`${label}-dark.png`), fullPage: true })
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(errors).toEqual([])
  })
}

test('search and all sorts are local; keyboard access and clearing work', async ({ page }) => {
  let requests = 0
  await page.route('https://api.coingecko.com/**', (route) => { requests++; return route.fulfill({ json: coins }) })
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(20)
  for (const sort of SORT_OPTIONS) {
    await page.getByRole('combobox', { name: 'Sort coins' }).click()
    await page.getByRole('option', { name: sort.label, exact: true }).click()
    await expect(page.getByRole('article')).toHaveCount(20)
  }
  await page.getByRole('searchbox').fill('BTC')
  await expect(page.getByRole('article')).toHaveCount(7)
  await page.getByRole('searchbox').fill('no-such-coin')
  await expect(page.getByRole('heading', { name: 'No coins found' })).toBeVisible()
  await page.locator('.market-state').getByRole('button', { name: 'Clear search' }).click()
  await expect(page.getByRole('article')).toHaveCount(20)
  expect(requests).toBe(1)
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to market' })).toBeFocused()
  await page.keyboard.press('Enter')
  expect(await page.evaluate(() => location.hash)).toBe('#main')
})

test('initial loading, API error, and successful retry', async ({ page }) => {
  let fail = true
  let release = () => {}
  const gate = new Promise<void>((resolve) => { release = resolve })
  await page.route('https://api.coingecko.com/**', async (route) => {
    await gate
    return fail ? route.fulfill({ status: 403, json: { error: 'Forbidden' } }) : route.fulfill({ json: coins })
  })
  await page.goto('/')
  await expect(page.locator('.skeleton-card')).toHaveCount(8)
  release()
  await expect(page.getByRole('heading', { name: 'The market is out of reach' })).toBeVisible()
  fail = false
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(20)
})

test('failed background refresh keeps prices; retry restores state', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(20)
  await page.route('https://api.coingecko.com/**', (route) => route.fulfill({ status: 403, json: {} }))
  await page.getByRole('button', { name: 'Refresh prices' }).click()
  await expect(page.getByRole('alert')).toContainText('Prices may be outdated')
  await expect(page.getByRole('article')).toHaveCount(20)
  await page.route('https://api.coingecko.com/**', (route) => route.fulfill({ json: coins }))
  await page.clock.fastForward(61_000)
  await page.getByRole('button', { name: 'Retry update' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('offline data is retained and stale data reconnects automatically', async ({ page, context }) => {
  let requests = 0
  await page.route('https://api.coingecko.com/**', (route) => { requests++; return route.fulfill({ json: coins }) })
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(20)
  await context.setOffline(true)
  await expect(page.getByText('You’re offline. Showing the last available prices. We’ll reconnect automatically.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Refresh prices' })).toBeDisabled()
  await expect(page.getByRole('article')).toHaveCount(20)
  await page.clock.fastForward(121_000)
  await context.setOffline(false)
  await expect.poll(() => requests).toBe(2)
  await expect(page.getByText('You’re offline. Showing the last available prices. We’ll reconnect automatically.')).toHaveCount(0)
})

test('rate limiting disables requests during the server cooldown', async ({ page }) => {
  let requests = 0
  await page.route('https://api.coingecko.com/**', (route) => { requests++; return route.fulfill({ status: 429, headers: { 'Retry-After': '120' }, json: {} }) })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'The market is out of reach' })).toBeVisible()
  await expect(page.locator('.market-state button')).toBeDisabled()
  await expect(page.locator('.refresh-button')).toBeDisabled()
  expect(requests).toBe(1)
})

test('network failure gives recovery guidance after limited retries', async ({ page }) => {
  await page.route('https://api.coingecko.com/**', (route) => route.abort('failed'))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'The market is out of reach' })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('alert')).toContainText('temporary service, rate-limit, or connection issue')
  await page.route('https://api.coingecko.com/**', (route) => route.fulfill({ json: coins }))
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(20)
})

for (const theme of ['light', 'dark'] as const) {
  test(`${theme} theme passes automated WCAG accessibility checks`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.getByRole('article')).toHaveCount(20)
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(scan.violations).toEqual([])
  })
}
