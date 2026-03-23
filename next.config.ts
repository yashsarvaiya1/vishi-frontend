import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc:   'app/sw.ts',
  swDest:  'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  output:            'standalone',
  reactStrictMode:   process.env.NODE_ENV !== 'development', // ← off in dev, on in prod
  turbopack:         {},
  transpilePackages: ['@tanstack/react-query'],
}

export default withSerwist(nextConfig)
