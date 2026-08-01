import { mkdir, readdir } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const publicDirectory = path.resolve("public")
const sourceDirectories = ["images", "gallery"]
const outputDirectory = path.join(publicDirectory, "optimized")
const supportedExtensions = new Set([".jpg", ".jpeg", ".png"])

async function findImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) return findImages(entryPath)

      return supportedExtensions.has(path.extname(entry.name).toLowerCase()) ? [entryPath] : []
    }),
  )

  return files.flat()
}

async function optimizeImage(sourcePath) {
  const relativePath = path.relative(publicDirectory, sourcePath)
  const parsedPath = path.parse(relativePath)
  const outputPath = path.join(outputDirectory, parsedPath.dir, `${parsedPath.name}.webp`)

  await mkdir(path.dirname(outputPath), { recursive: true })
  await sharp(sourcePath)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath)

  return path.relative(publicDirectory, outputPath).replaceAll(path.sep, "/")
}

const sourcePaths = (
  await Promise.all(sourceDirectories.map((directory) => findImages(path.join(publicDirectory, directory))))
).flat()

const outputPaths = await Promise.all(sourcePaths.map(optimizeImage))

console.log(`Optimized ${outputPaths.length} images into public/optimized.`)
