import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { encode } from "next-auth/jwt"

function getBaseUrl(req: NextRequest): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "")
  const proto = req.headers.get("x-forwarded-proto") ?? "https"
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000"
  return `${proto}://${host}`
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = getBaseUrl(req)
    const params = Object.fromEntries(req.nextUrl.searchParams.entries())

    // Verify the OpenID assertion with Steam
    const verifyBody = new URLSearchParams({
      ...params,
      "openid.mode": "check_authentication",
    })
    const verifyRes = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyBody.toString(),
    })
    const verifyText = await verifyRes.text()

    if (!verifyText.includes("is_valid:true")) {
      console.error("[steam/callback] verification failed. Steam response:", verifyText.slice(0, 200))
      return NextResponse.redirect(`${baseUrl}?error=steam_auth_failed`)
    }

    // Extract 17-digit Steam ID from claimed_id URL
    const steamId = params["openid.claimed_id"]?.match(/(\d{17})$/)?.[1]
    if (!steamId) {
      console.error("[steam/callback] no steamId in claimed_id:", params["openid.claimed_id"])
      return NextResponse.redirect(`${baseUrl}?error=invalid_steam_id`)
    }

    // Fetch Steam profile
    const profileRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    )
    const profileText = await profileRes.text()

    let profileData: { response?: { players?: Array<{ personaname: string; avatarfull: string }> } }
    try {
      profileData = JSON.parse(profileText)
    } catch {
      console.error("[steam/callback] Steam API non-JSON (bad API key?). Status:", profileRes.status, profileText.slice(0, 150))
      return NextResponse.redirect(`${baseUrl}?error=steam_profile_not_found`)
    }

    const player = profileData?.response?.players?.[0]
    if (!player) {
      console.error("[steam/callback] no player found for steamId:", steamId)
      return NextResponse.redirect(`${baseUrl}?error=steam_profile_not_found`)
    }

    // Build a NextAuth-compatible JWT and set it as the session cookie
    const token = await encode({
      token: {
        sub: steamId,
        steamId,
        name: player.personaname as string,
        picture: player.avatarfull as string,
        email: null,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: 30 * 24 * 60 * 60,
    })

    const isSecure = baseUrl.startsWith("https://")
    const cookieName = isSecure
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token"

    const response = NextResponse.redirect(`${baseUrl}/dashboard`)
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })
    return response
  } catch (err) {
    console.error("[steam/callback] uncaught error:", err instanceof Error ? err.message : String(err))
    return NextResponse.json(
      { error: "internal_error", message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
