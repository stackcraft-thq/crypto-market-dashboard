import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { testCoins } from '../src/test/fixtures/coins'

for (const theme of ['light', 'dark'] as const) {
  test(`${theme}: styled dropdown supports keyboard selection, escape, and outside dismissal`, async ({ page }, testInfo) => {
    await page.route('https://api.coingecko.com/**', (route) => route.fulfill({ json: testCoins }))
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1200, height: 1000 })
    await page.goto('/')
    await expect(page.getByRole('article')).toHaveCount(3)
    await page.getByRole('switch', { name: 'Auto-update' }).click()
    const trigger = page.getByRole('combobox', { name: 'Update interval' })
    await trigger.focus()
    await page.keyboard.press('Space')
    await expect(page.getByRole('listbox', { name: 'Update interval' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Every 1 minute', exact: true })).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('option', { name: 'Every 2 minutes', exact: true })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveText('Every 2 minutes')
    await expect(trigger).toBeFocused()
    await trigger.click()
    // Scan the open menu; the closed page has separate full-page Axe coverage.
    const scan = await new AxeBuilder({ page }).include('.dropdown-menu').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(scan.violations).toEqual([])
    await page.screenshot({ path: testInfo.outputPath(`dropdown-${theme}.png`) })
    await page.keyboard.press('Tab')
    await expect(page.getByRole('option', { name: 'Every 2 minutes', exact: true })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('listbox')).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await trigger.click()
    const heading = await page.locator('#market-title').boundingBox()
    if (!heading) throw new Error('Market heading is not visible')
    await page.mouse.click(heading.x + 10, heading.y + 10)
    await expect(page.getByRole('listbox')).toHaveCount(0)
    await expect(trigger).toHaveText('Every 2 minutes')
  })
}
