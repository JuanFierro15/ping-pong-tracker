import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })

const src = 'scripts/icon-source.svg'

const targets = [
  { file: 'public/icons/icon-192.png', size: 192 },
  { file: 'public/icons/icon-512.png', size: 512 },
  { file: 'public/pwa-192.png', size: 192 },
  { file: 'public/pwa-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
  { file: 'public/favicon.png', size: 64 },
]

for (const t of targets) {
  await sharp(src).resize(t.size, t.size).png().toFile(t.file)
  console.log('wrote', t.file)
}

// Maskable icon: same design but with extra safe-zone padding (icon content within ~80% circle)
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#111827"/>
  <g transform="translate(256 256) scale(0.72) translate(-256 -256)">
    <circle cx="256" cy="256" r="200" fill="#1f2937"/>
    <g transform="translate(256 256) rotate(-40)">
      <rect x="-40" y="-10" width="150" height="20" rx="10" fill="#9ca3af"/>
      <ellipse cx="-90" cy="0" rx="70" ry="85" fill="#dc2626"/>
      <ellipse cx="-90" cy="0" rx="70" ry="85" fill="none" stroke="#7f1d1d" stroke-width="6"/>
    </g>
    <circle cx="150" cy="150" r="34" fill="#f9fafb"/>
    <circle cx="150" cy="150" r="34" fill="none" stroke="#d1d5db" stroke-width="4"/>
  </g>
</svg>
`
await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile('public/icons/icon-maskable-512.png')
console.log('wrote public/icons/icon-maskable-512.png')
