import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // In local dev, the origin is always correct (no proxy in between)
        return NextResponse.redirect(`${origin}${next}`)
      }

      // In production, always use NEXT_PUBLIC_SITE_URL as the authoritative base.
      // Relying on `origin` can leak the internal localhost address when behind
      // Vercel's proxy, breaking OAuth redirects for users on other devices.
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || // strip trailing slash
        `https://${request.headers.get('x-forwarded-host')}` ||
        origin

      return NextResponse.redirect(`${siteUrl}${next}`)
    }
  }

  // Return the user to an error page with instructions
  const siteUrl =
    process.env.NODE_ENV === 'development'
      ? origin
      : process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || origin

  return NextResponse.redirect(`${siteUrl}/login?error=Invalid_Auth_Callback`)
}
