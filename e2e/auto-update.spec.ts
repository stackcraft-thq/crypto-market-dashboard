import { expect, test } from '@playwright/test'
import { testCoins } from '../src/test/fixtures/coins'

test('auto-update refreshes prices every minute and stops when switched off', async ({ page }) => {
  let requests = 0
  await page.route('https://api.coingecko.com/**', (route) => {
    requests++
    return route.fulfill({ json: testCoins.map((coin) => ({ ...coin, current_price: (coin.current_price ?? 0) + requests })) })
  })
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(3)
  const toggle = page.getByRole('switch', { name: 'Auto-update' })
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await page.clock.fastForward(61_000)
  expect(requests).toBe(1)
  await toggle.click()
  await expect(page.getByText('Every 60 seconds', { exact: true })).toBeVisible()
  await page.clock.fastForward(61_000)
  await expect.poll(() => requests).toBe(2)
  await expect(page.getByText('$65,002.00', { exact: true })).toBeVisible()
  await toggle.click()
  await page.clock.fastForward(121_000)
  expect(requests).toBe(2)
})

test('auto-update honors a rate-limit cooldown and resumes after it expires', async ({ page }) => {
  let requests = 0
  await page.route('https://api.coingecko.com/**', (route) => {
    requests++
    return requests === 2
      ? route.fulfill({ status: 429, headers: { 'Retry-After': '180', 'Access-Control-Expose-Headers': 'Retry-After' }, json: {} })
      : route.fulfill({ json: testCoins })
  })
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(3)
  await page.getByRole('switch', { name: 'Auto-update' }).click()
  await page.clock.fastForward(61_000)
  await expect(page.getByText('Paused · rate limit', { exact: true })).toBeVisible()
  await page.clock.fastForward(121_000)
  expect(requests).toBe(2)
  await expect(page.getByRole('article')).toHaveCount(3)
  await page.clock.fastForward(61_000)
  await expect.poll(() => requests).toBe(3)
  await expect(page.getByText('Every 60 seconds', { exact: true })).toBeVisible()
})

test('auto-update pauses offline and resumes when the connection returns', async ({ page, context }) => {
  let requests = 0
  await page.route('https://api.coingecko.com/**', (route) => { requests++; return route.fulfill({ json: testCoins }) })
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(3)
  await page.getByRole('switch', { name: 'Auto-update' }).click()
  await context.setOffline(true)
  await expect(page.getByText('Paused · offline', { exact: true })).toBeVisible()
  await page.clock.fastForward(181_000)
  expect(requests).toBe(1)
  await context.setOffline(false)
  await expect.poll(() => requests).toBe(2)
  await page.clock.fastForward(61_000)
  await expect.poll(() => requests).toBe(3)
})

test('auto-update skips hidden tabs and keeps search and sort after updating', async ({ page }) => {
  let requests = 0
  await page.route('https://api.coingecko.com/**', (route) => { requests++; return route.fulfill({ json: testCoins }) })
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(3)
  await page.getByRole('searchbox').fill('BTC')
  await page.getByRole('combobox', { name: 'Sort coins' }).click()
  await page.getByRole('option', { name: 'Price: low to high', exact: true }).click()
  await page.getByRole('switch', { name: 'Auto-update' }).click()
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.clock.fastForward(181_000)
  expect(requests).toBe(1)
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.clock.fastForward(61_000)
  await expect.poll(() => requests).toBe(2)
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByRole('searchbox')).toHaveValue('BTC')
  await expect(page.getByRole('combobox', { name: 'Sort coins' })).toHaveText('Price: low to high')
})

test('auto-update pauses after API errors and resumes after a successful manual retry', async ({ page }) => {
  let requests = 0
  await page.route('https://api.coingecko.com/**', (route) => {
    requests++
    return requests === 2 ? route.fulfill({ status: 403, json: {} }) : route.fulfill({ json: testCoins })
  })
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(3)
  await page.getByRole('switch', { name: 'Auto-update' }).click()
  await page.clock.fastForward(61_000)
  await expect(page.getByText('Paused · retry to resume', { exact: true })).toBeVisible()
  await page.clock.fastForward(181_000)
  expect(requests).toBe(2)
  await page.getByRole('button', { name: 'Retry update' }).click()
  await expect(page.getByText('Every 60 seconds', { exact: true })).toBeVisible()
  await page.clock.fastForward(61_000)
  await expect.poll(() => requests).toBe(4)
})
