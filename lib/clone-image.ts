import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import sharp from "sharp"

/**
 * Clone an external image URL to local uploads folder
 * Compresses and converts to WebP format
 * Returns the local URL if successful, or original URL if failed
 */
export async function cloneExternalImage(url: string): Promise<string> {
    // Skip if already local
    if (url.startsWith("/uploads/") || url.startsWith("/placeholder")) {
        return url
    }

    // Skip if not a valid URL
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return url
    }

    try {
        // Fetch the image
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Zenixa/1.0)'
            }
        })

        if (!response.ok) {
            console.warn(`Failed to fetch image: ${url}`)
            return url
        }

        const contentType = response.headers.get("content-type") || "image/jpeg"
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

        if (!validTypes.some(type => contentType.includes(type))) {
            console.warn(`Invalid content type for ${url}: ${contentType}`)
            return url
        }

        // Get image data
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Create uploads directory if not exists
        const uploadDir = path.join(process.cwd(), "public", "uploads")
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(7)

        // Handle SVG separately (no compression)
        if (contentType.includes("svg")) {
            const filename = `${timestamp}-${randomStr}.svg`
            const filepath = path.join(uploadDir, filename)
            await writeFile(filepath, buffer)
            console.log(`Cloned SVG: ${url} -> /uploads/${filename}`)
            return `/uploads/${filename}`
        }

        // For other images, compress to WebP
        const filename = `${timestamp}-${randomStr}.webp`
        const filepath = path.join(uploadDir, filename)
        const localUrl = `/uploads/${filename}`

        // Compress and convert to WebP
        await sharp(buffer)
            .webp({
                quality: 80,  // Good balance of quality and size
                effort: 4     // Compression effort (0-6, higher = smaller but slower)
            })
            .toFile(filepath)

        console.log(`Cloned & compressed: ${url} -> ${localUrl}`)
        return localUrl
    } catch (error) {
        console.error(`Failed to clone image ${url}:`, error)
        return url
    }
}

/**
 * Clone multiple images in parallel with concurrency limit
 */
export async function cloneExternalImages(
    urls: string[],
    concurrency: number = 3
): Promise<string[]> {
    const results: string[] = []

    for (let i = 0; i < urls.length; i += concurrency) {
        const batch = urls.slice(i, i + concurrency)
        const batchResults = await Promise.all(batch.map(cloneExternalImage))
        results.push(...batchResults)
    }

    return results
}
