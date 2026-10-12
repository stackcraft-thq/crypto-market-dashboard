import { expect, test } from '@playwright/test'
import { testCoins } from '../src/test/fixtures/coins'

test('rapid manual refreshes make only one additional request and show a cooldown', async ({ page }) => {
  let requests = 0
  await page.route('https://api.coingecko.com/**', (route) => { requests++; return route.fulfill({ json: testCoins }) })
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(3)
  await page.getByRole('button', { name: 'Refresh prices', exact: true }).click()
  await expect.poll(() => requests).toBe(2)
  await expect(page.locator('.refresh-button')).toBeDisabled()
  await expect(page.locator('.refresh-button')).toContainText('Refresh in')
  await page.locator('.refresh-button').evaluate((button) => { for (let i = 0; i < 10; i++) (button as HTMLButtonElement).click() })
  expect(requests).toBe(2)
  await page.clock.fastForward(61_000)
  await expect(page.getByRole('button', { name: 'Refresh prices', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Refresh prices', exact: true }).click()
  await expect.poll(() => requests).toBe(3)
})

test('an unreadable server failure does not claim the user is offline and retry shares the cooldown', async ({ page }) => {
  let requests = 0
  await page.route('https://api.coingecko.com/**', (route) => {
    requests++
    return requests === 1 ? route.fulfill({ json: testCoins }) : route.abort('failed')
  })
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(3)
  await page.getByRole('button', { name: 'Refresh prices', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('temporary service, rate-limit, or connection issue', { timeout: 10_000 })
  await expect(page.getByRole('alert')).not.toContainText('Check your connection')
  await expect(page.locator('.notice button')).toBeDisabled()
  await expect(page.locator('.refresh-button')).toBeDisabled()
  await expect(page.getByRole('article')).toHaveCount(3)
})
