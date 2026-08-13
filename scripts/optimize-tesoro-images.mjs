import { mkdir } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const publicDirectory = path.resolve("public")

const assets = [
  ...[1, 3, 4, 5, 6].map((number) => ({
    source: `tesoro/personaje/pieza-${number}.png.png`,
    destination: `tesoro/personaje/personaje-${number}.webp`,
    width: 512,
    quality: 88,
  })),
  ...[1, 2, 3, 4, 5, 6].map((number) => ({
    source: `tesoro/piezas/coloraditas_pieza_${number}.png`,
    destination: `tesoro/piezas/coloraditas_pieza_${number}.webp`,
    quality: 88,
  })),
  {
    source: "tesoro/piezas/coloraditas_completa.png",
    destination: "tesoro/piezas/coloraditas_completa.webp",
    quality: 84,
  },
  {
    source: "tesoro/desafios/teatro/teatro-incompleto.png",
    destination: "tesoro/desafios/teatro/teatro-incompleto.webp",
    width: 1200,
    quality: 84,
  },
  ...["a", "b", "c", "d"].map((letter) => ({
    source: `tesoro/desafios/teatro/opcion-${letter}.png`,
    destination: `tesoro/desafios/teatro/opcion-${letter}.webp`,
    quality: 88,
  })),
  {
    source: "tesoro/desafios/bellas-artes/patio-original.jpg",
    destination: "tesoro/desafios/bellas-artes/patio-original.webp",
    width: 1400,
    quality: 85,
  },
  ...["a", "b", "c", "d"].map((letter) => ({
    source: `tesoro/desafios/bellas-artes/bellas-artes-opcion-${letter}.png`,
    destination: `tesoro/desafios/bellas-artes/bellas-artes-opcion-${letter}.webp`,
    quality: 90,
  })),
  ...["a", "b", "c", "d"].map((letter) => ({
    source: `tesoro/desafios/rosedal/opcion-${letter}.png`,
    destination: `tesoro/desafios/rosedal/opcion-${letter}.webp`,
    quality: 86,
  })),
]

await Promise.all(assets.map(async ({ source, destination, width, quality }) => {
  const destinationPath = path.join(publicDirectory, destination)
  await mkdir(path.dirname(destinationPath), { recursive: true })

  await sharp(path.join(publicDirectory, source))
    .rotate()
    .resize(width ? { width, withoutEnlargement: true } : undefined)
    .webp({ quality, effort: 5, smartSubsample: true })
    .toFile(destinationPath)
}))

console.log(`Optimized ${assets.length} Tesoro assets into WebP.`)
