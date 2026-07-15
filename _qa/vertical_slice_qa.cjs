const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const out = path.join(__dirname, 'ui')
fs.mkdirSync(out, { recursive: true })

async function hold(locator, page, ms = 720) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Verdict button has no bounding box')
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.waitForTimeout(ms)
  await page.mouse.up()
}

async function audit(page, label) {
  return page.evaluate((name) => {
    const targets = [...document.querySelectorAll('button')].map((el) => {
      const r = el.getBoundingClientRect()
      return { text: (el.textContent || '').trim().slice(0, 40), width: r.width, height: r.height }
    })
    return {
      label: name,
      viewport: { width: innerWidth, height: innerHeight },
      body: { scrollWidth: document.body.scrollWidth, clientWidth: document.body.clientWidth },
      targets,
      tooSmall: targets.filter((item) => item.width < 44 || item.height < 44),
    }
  }, label)
}

async function runViewport(browser, viewport, suffix) {
  const page = await browser.newPage({ viewport, reducedMotion: 'no-preference' })
  await page.addInitScript(() => localStorage.setItem('game_locale', 'zh'))
  const errors = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(out, `01-start-${suffix}.png`), fullPage: true })
  const startAudit = await audit(page, `start-${suffix}`)

  await page.getByRole('button', { name: /开始午夜值班|BEGIN MIDNIGHT SHIFT/ }).click()
  await page.waitForTimeout(450)
  await page.screenshot({ path: path.join(out, `02-case-${suffix}.png`), fullPage: true })
  const caseAudit = await audit(page, `case-${suffix}`)

  await page.getByRole('button', { name: /暂停|Pause/ }).click()
  await page.waitForTimeout(120)
  await page.screenshot({ path: path.join(out, `02b-pause-${suffix}.png`), fullPage: true })
  const pauseAudit = await audit(page, `pause-${suffix}`)
  await page.getByRole('button', { name: /继续核验|RESUME REVIEW/ }).click()

  await page.getByRole('button', { name: /因果回声|Causal Echo/ }).click()
  await page.waitForTimeout(260)
  await page.screenshot({ path: path.join(out, `03-evidence-${suffix}.png`), fullPage: true })
  const evidenceAudit = await audit(page, `evidence-${suffix}`)
  await page.getByRole('button', { name: /关闭档案|CLOSE FILE/ }).last().click()

  await hold(page.getByRole('button', { name: /送回原线|RETURN TO LINE/ }), page)
  await page.waitForTimeout(1450)
  await page.screenshot({ path: path.join(out, `04-reveal-${suffix}.png`), fullPage: true })
  const revealAudit = await audit(page, `reveal-${suffix}`)
  await page.waitForTimeout(2500)
  const stillReveal = await page.getByRole('button', { name: /归档此裁定|ARCHIVE RULING/ }).isVisible()

  await page.getByRole('button', { name: /归档此裁定|ARCHIVE RULING/ }).click()
  await page.waitForTimeout(220)

  // Case 2: keep Ada's future map so case 4 must surface a visible prior-case echo.
  await hold(page.getByRole('button', { name: /留在现世|KEEP IN PRESENT/ }), page)
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: /归档此裁定|ARCHIVE RULING/ }).click()
  await page.waitForTimeout(180)

  // Case 3.
  await hold(page.getByRole('button', { name: /送回原线|RETURN TO LINE/ }), page)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(out, `04c-failure-reveal-${suffix}.png`), fullPage: true })
  const failureVisible = await page.getByText(/判定失误|RULING FAILED/).isVisible()
  await page.getByRole('button', { name: /归档此裁定|ARCHIVE RULING/ }).click()
  await page.waitForTimeout(250)

  const echoVisible = await page.locator('.ltb-echo-note').isVisible()
  await page.screenshot({ path: path.join(out, `04b-echo-case-${suffix}.png`), fullPage: true })
  const echoAudit = await audit(page, `echo-case-${suffix}`)

  // Cases 4–7: keep alternating to preserve both resources.
  for (const choice of ['stay', 'return', 'stay', 'return']) {
    const locator = choice === 'stay'
      ? page.getByRole('button', { name: /留在现世|KEEP IN PRESENT/ })
      : page.getByRole('button', { name: /送回原线|RETURN TO LINE/ })
    await hold(locator, page)
    await page.waitForTimeout(1500)
    if (choice === 'return' && await page.locator('.ltb-result').isVisible()) break
    await page.getByRole('button', { name: /归档此裁定|ARCHIVE RULING/ }).click()
    await page.waitForTimeout(200)
  }

  await page.screenshot({ path: path.join(out, `05-result-${suffix}.png`), fullPage: true })
  const resultAudit = await audit(page, `result-${suffix}`)

  await page.close()
  return { suffix, errors, stillReveal, echoVisible, failureVisible, audits: [startAudit, caseAudit, pauseAudit, evidenceAudit, revealAudit, echoAudit, resultAudit] }
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const results = []
  results.push(await runViewport(browser, { width: 390, height: 844 }, '390x844'))
  results.push(await runViewport(browser, { width: 320, height: 568 }, '320x568'))
  await browser.close()
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
