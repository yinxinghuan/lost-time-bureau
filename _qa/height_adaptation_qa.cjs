const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const outputDir = path.join(__dirname, 'ui')
fs.mkdirSync(outputDir, { recursive: true })

const viewports = [
  { width: 320, height: 568, label: 'short-phone' },
  { width: 390, height: 844, label: 'standard-phone' },
  { width: 430, height: 932, label: 'tall-phone' },
  { width: 844, height: 390, label: 'short-window' },
]

async function geometry(page, state, viewport) {
  return page.evaluate(({ stateName, expected }) => {
    const root = document.querySelector('.ltb')
    const rootRect = root?.getBoundingClientRect()
    const visibleButtons = [...document.querySelectorAll('button')].filter((element) => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0
    })
    return {
      state: stateName,
      viewport: expected,
      rootHeight: rootRect?.height ?? 0,
      bodyScrollHeight: document.body.scrollHeight,
      documentScrollHeight: document.documentElement.scrollHeight,
      clippedButtons: visibleButtons
        .map((element) => {
          const rect = element.getBoundingClientRect()
          return {
            label: (element.textContent || element.getAttribute('aria-label') || '').trim().slice(0, 40),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            height: Math.round(rect.height),
          }
        })
        .filter((item) => item.top < 0 || item.bottom > innerHeight || item.height < 44),
    }
  }, { stateName: state, expected: viewport })
}

async function run(browser, viewport) {
  const page = await browser.newPage({ viewport })
  await page.addInitScript(() => localStorage.setItem('game_locale', 'en'))
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })

  const results = [await geometry(page, 'start', viewport)]
  await page.getByRole('button', { name: 'START THE SHIFT' }).click()
  await page.waitForTimeout(160)
  results.push(await geometry(page, 'case', viewport))

  await page.getByRole('button', { name: 'CLUE 3' }).click()
  await page.waitForTimeout(160)
  results.push(await geometry(page, 'clue', viewport))
  await page.getByRole('button', { name: 'DONE' }).click()

  await page.getByRole('button', { name: 'Open the live time map' }).click()
  await page.waitForTimeout(160)
  results.push(await geometry(page, 'map', viewport))
  await page.screenshot({ path: path.join(outputDir, `height-${viewport.label}.png`) })

  await page.close()
  return results
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const results = []
  for (const viewport of viewports) results.push(...await run(browser, viewport))
  await browser.close()

  const failures = results.filter((result) => (
    Math.abs(result.rootHeight - result.viewport.height) > 1
    || result.bodyScrollHeight > result.viewport.height
    || result.documentScrollHeight > result.viewport.height
    || result.clippedButtons.length > 0
  ))

  const report = { results, failures }
  fs.writeFileSync(path.join(outputDir, 'height-report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (failures.length) process.exit(1)
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
