// Genera las capturas de pantalla usadas en el README (docs/screenshots/).
// Requiere que la app esté corriendo en local (npm run dev) y usa datos de
// prueba ficticios ("Jugador 1" / "Jugador 2") generados jugando un partido
// real a través de la UI, para no depender de seeds directos a IndexedDB.
//
// Uso: node scripts/capture-screenshots.mjs [URL]
// (por defecto usa http://localhost:5173)

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots')
const URL = process.argv[2] || 'http://localhost:5173'

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'es-CO',
  })
  const page = await context.newPage()

  await page.goto(URL)
  await page.waitForTimeout(400)

  // 1) Setup — edición de nombres de jugadores (valores ficticios por defecto)
  await shot(page, '01-setup.png')

  await page.getByRole('button', { name: 'Iniciar partido' }).click()
  await page.waitForTimeout(200)

  // Anota algunos puntos para que el marcador en vivo no se vea en 0-0.
  const p1 = page.locator('button', { hasText: 'Jugador 1' })
  const p2 = page.locator('button', { hasText: 'Jugador 2' })
  await tapTimes(p1, 7)
  await tapTimes(p2, 5)

  // 2) Marcador en vivo — partido en curso
  await shot(page, '02-marcador.png')

  // Termina el set 1 (11-7) y el set 2 (11-8) para cerrar el partido 2-0.
  await tapTimes(p1, 4)
  await page.waitForTimeout(300)
  await tapTimes(p1, 8)
  await tapTimes(p2, 8)
  await tapTimes(p1, 3)
  await page.waitForTimeout(900)

  // 6) Resumen de partido terminado, con el botón "Compartir resultado"
  await shot(page, '06-resultado.png')

  // Juega varios partidos más entre los mismos dos jugadores, con una
  // ventaja clara para Jugador 1 (5 de 8 en total), para que el historial
  // muestre paginación (más de 7 partidos) y la pestaña Cara a cara
  // muestre un winrate con colores.
  const moreResults = ['player2', 'player1', 'player2', 'player1', 'player2', 'player1', 'player1']
  for (const winner of moreResults) {
    await page.getByRole('button', { name: 'Nuevo partido' }).click()
    await page.waitForTimeout(150)
    await page.getByRole('button', { name: 'Iniciar partido' }).click()
    await page.waitForTimeout(150)
    const winnerLocator = winner === 'player1' ? p1 : p2
    await tapTimes(winnerLocator, 11)
    await page.waitForTimeout(300)
    await tapTimes(winnerLocator, 11)
    await page.waitForTimeout(500)
  }
  await page.getByRole('button', { name: 'Nuevo partido' }).click()
  await page.waitForTimeout(150)

  await page.getByRole('button', { name: 'Historial' }).click()
  await page.waitForTimeout(700)

  // Baja el scroll de la lista para que se alcancen a ver los controles
  // de paginación numerados, no solo los primeros partidos.
  await page.evaluate(() => document.querySelector('.overflow-y-auto')?.scrollTo(0, 999))
  await page.waitForTimeout(200)

  // 3) Historial > pestaña Partidos (con paginación: más de 7 partidos)
  await shot(page, '03-historial-partidos.png')

  await page.getByRole('button', { name: 'Jugador', exact: true }).click()
  await page.waitForTimeout(500)

  // 4) Historial > pestaña Jugador
  await shot(page, '04-historial-jugador.png')

  await page.getByRole('button', { name: 'Cara a cara' }).click()
  await page.waitForTimeout(500)

  // 5) Historial > pestaña Cara a cara (winrate con colores)
  await shot(page, '05-historial-cara-a-cara.png')

  await browser.close()
  console.log(`Listo. Capturas guardadas en ${OUT_DIR}`)
}

async function tapTimes(locator, times) {
  for (let i = 0; i < times; i += 1) {
    await locator.click()
  }
}

async function shot(page, filename) {
  const file = path.join(OUT_DIR, filename)
  await page.screenshot({ path: file })
  console.log(`✓ ${filename}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
