import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],

  /**
   * Forward /api/* to the Laravel API (set API_ORIGIN, e.g. https://onehealth-backend-7lwx.onrender.com).
   *
   * Why: the API sets a session cookie and an XSRF cookie that JavaScript must read. A page on
   * one website cannot read cookies that belong to another website, so if the browser called the
   * API's address directly every POST would fail. Through this rewrite the browser only ever talks
   * to the app's own address, so both cookies are first-party. Use NEXT_PUBLIC_API_URL=/api/v1
   * when this is on. Leave API_ORIGIN unset to call the API directly (local development).
   */
  async rewrites() {
    const origin = process.env.API_ORIGIN?.replace(/\/$/, "")
    return origin ? [{ source: "/api/:path*", destination: `${origin}/api/:path*` }] : []
  },
}

export default nextConfig
