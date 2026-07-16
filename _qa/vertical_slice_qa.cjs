const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const out = path.join(__dirname, 'ui')
fs.mkdirSync(out, { recursive: true })

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

  await page.getByRole('button', { name: /开始值班|START THE SHIFT/ }).click()
  await page.waitForTimeout(450)
  await page.screenshot({ path: path.join(out, `02-case-${suffix}.png`), fullPage: true })
  const caseAudit = await audit(page, `case-${suffix}`)

  await page.getByRole('button', { name: /查看今晚状态|Open tonight’s status/ }).click()
  await page.waitForTimeout(220)
  await page.screenshot({ path: path.join(out, `02a-status-${suffix}.png`), fullPage: true })
  const statusAudit = await audit(page, `status-${suffix}`)
  await page.getByRole('button', { name: /回到来客|BACK TO VISITOR/ }).click()

  await page.getByRole('button', { name: /查看实时的时空图|Open the live time map/ }).click()
  await page.waitForTimeout(220)
  await page.screenshot({ path: path.join(out, `02b-map-initial-${suffix}.png`), fullPage: true })
  const mapInitialAudit = await audit(page, `map-initial-${suffix}`)
  const mapInitialVisible = await page.getByText(/你在这里|YOU ARE HERE/).isVisible()
  await page.getByRole('button', { name: /回到当前来客|BACK TO VISITOR/ }).click()

  await page.getByRole('button', { name: /暂停|Pause/ }).click()
  await page.waitForTimeout(120)
  await page.screenshot({ path: path.join(out, `02c-pause-${suffix}.png`), fullPage: true })
  const pauseAudit = await audit(page, `pause-${suffix}`)
  await page.getByRole('button', { name: /继续|CONTINUE/ }).click()

  await page.getByRole('button', { name: /线索 3|CLUE 3/ }).click()
  await page.waitForTimeout(260)
  await page.screenshot({ path: path.join(out, `03-evidence-${suffix}.png`), fullPage: true })
  const evidenceAudit = await audit(page, `evidence-${suffix}`)
  await page.getByRole('button', { name: /展开细节|OPEN DETAILS/ }).click()
  await page.waitForTimeout(180)
  await page.screenshot({ path: path.join(out, `03b-evidence-detail-${suffix}.png`), fullPage: true })
  const detailAudit = await audit(page, `evidence-detail-${suffix}`)
  await page.getByRole('button', { name: /看完了|DONE/ }).click()

  await page.getByRole('button', { name: /送回|SEND BACK/ }).click()
  await page.waitForTimeout(350)
  await page.screenshot({ path: path.join(out, `04-reveal-${suffix}.png`), fullPage: true })
  const revealAudit = await audit(page, `reveal-${suffix}`)
  const stillReveal = await page.getByRole('button', { name: /看看为什么|SEE WHY/ }).isVisible()

  await page.getByRole('button', { name: /看看为什么|SEE WHY/ }).click()
  await page.waitForTimeout(220)
  await page.screenshot({ path: path.join(out, `04a-compare-${suffix}.png`), fullPage: true })
  const compareVisible = await page.getByText(/线索指向|CLUES POINT TO/).isVisible()
  await page.getByRole('button', { name: /看看后来|SEE WHAT HAPPENED/ }).click()
  await page.waitForTimeout(180)
  await page.screenshot({ path: path.join(out, `04b-timeline-${suffix}.png`), fullPage: true })
  const reportVisible = await page.getByText(/后来发生了什么|WHAT HAPPENED NEXT/).isVisible()
  await page.getByRole('button', { name: /下一位|NEXT VISITOR/ }).click()
  await page.waitForTimeout(220)

  // Case 2: keep Ada's future map so case 4 resolves against the earlier choice.
  await page.getByRole('button', { name: /留下|LET STAY/ }).click()
  await page.getByRole('button', { name: /看看为什么|SEE WHY/ }).click()
  await page.getByRole('button', { name: /看看后来|SEE WHAT HAPPENED/ }).click()
  await page.getByRole('button', { name: /下一位|NEXT VISITOR/ }).click()
  await page.waitForTimeout(180)

  // Case 3.
  await page.getByRole('button', { name: /送回|SEND BACK/ }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(out, `04c-failure-reveal-${suffix}.png`), fullPage: true })
  const failureVisible = await page.getByText(/判错了|NOT QUITE/).isVisible()
  await page.getByRole('button', { name: /看看为什么|SEE WHY/ }).click()
  await page.getByRole('button', { name: /看看后来|SEE WHAT HAPPENED/ }).click()
  await page.getByRole('button', { name: /下一位|NEXT VISITOR/ }).click()
  await page.waitForTimeout(250)

  await page.getByRole('button', { name: /查看实时的时空图|Open the live time map/ }).click()
  await page.waitForTimeout(220)
  await page.screenshot({ path: path.join(out, `04d-map-live-${suffix}.png`), fullPage: true })
  const mapLiveAudit = await audit(page, `map-live-${suffix}`)
  const mapLiveVisible = await page.getByText(/已留下|LET STAY/).first().isVisible()
  await page.getByRole('button', { name: /回到当前来客|BACK TO VISITOR/ }).click()

  await page.screenshot({ path: path.join(out, `04b-echo-case-${suffix}.png`), fullPage: true })
  const echoAudit = await audit(page, `echo-case-${suffix}`)

  // Cases 4–7: keep alternating to preserve both resources.
  for (const choice of ['stay', 'return', 'stay', 'return']) {
    const locator = choice === 'stay'
      ? page.getByRole('button', { name: /留下|LET STAY/ })
      : page.getByRole('button', { name: /送回|SEND BACK/ })
    await locator.click()
    await page.getByRole('button', { name: /看看为什么|SEE WHY/ }).click()
    await page.getByRole('button', { name: /看看后来|SEE WHAT HAPPENED/ }).click()
    const next = page.getByRole('button', { name: /下一位|查看结果|NEXT VISITOR|SEE RESULTS/ })
    await next.click()
    await page.waitForTimeout(200)
  }

  await page.screenshot({ path: path.join(out, `05-result-${suffix}.png`), fullPage: true })
  const resultAudit = await audit(page, `result-${suffix}`)

  await page.close()
  return { suffix, errors, stillReveal, compareVisible, reportVisible, failureVisible, mapInitialVisible, mapLiveVisible, audits: [startAudit, caseAudit, statusAudit, mapInitialAudit, mapLiveAudit, pauseAudit, evidenceAudit, detailAudit, revealAudit, echoAudit, resultAudit] }
}

async function runEnglishMap(browser) {
  const suffix = 'en-320x568'
  const page = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' })
  await page.addInitScript(() => localStorage.setItem('game_locale', 'en'))
  const errors = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /START THE SHIFT/ }).click()
  await page.waitForTimeout(180)
  await page.screenshot({ path: path.join(out, `02d-case-${suffix}.png`), fullPage: true })
  const caseAudit = await audit(page, `case-${suffix}`)
  await page.getByRole('button', { name: /Open the live time map/ }).click()
  await page.waitForTimeout(180)
  await page.screenshot({ path: path.join(out, `02e-map-${suffix}.png`), fullPage: true })
  const mapAudit = await audit(page, `map-${suffix}`)
  const mapVisible = await page.getByText(/YOU ARE HERE/).isVisible()
  await page.close()
  return { suffix, errors, mapVisible, audits: [caseAudit, mapAudit] }
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const results = []
  results.push(await runViewport(browser, { width: 390, height: 844 }, '390x844'))
  results.push(await runViewport(browser, { width: 320, height: 568 }, '320x568'))
  results.push(await runEnglishMap(browser))
  await browser.close()
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
