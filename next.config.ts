import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Turbopack is now the default bundler in Next.js 16
    // No explicit configuration needed unless customizing

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: '**', // Allow all external images for flexibility
            },
        ],
    },

    // Disable cacheComponents for now - causes issues with async data in layouts
    cacheComponents: false,
}

export default nextConfig
