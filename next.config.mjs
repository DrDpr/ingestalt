import createMDX from '@next/mdx'

const isVercel = process.env.VERCEL === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  ...(!isVercel && {
    output: 'export',
    basePath: '/ingestalt',
    assetPrefix: '/ingestalt/',
  }),
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)

// Made with Bob
