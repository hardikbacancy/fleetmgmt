import { jwtVerify } from 'jose'
import { NextResponse, type NextRequest } from 'next/server'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

interface SessionPayload {
  userId: string
  role: string
  fleetOwnerId: string | null
}

async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  try {
    const token = request.cookies.get('session')?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = pathname.startsWith('/login') || pathname.startsWith('/register')

  const session = await getSessionFromRequest(request)

  if (!session && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (session && isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = session.role === 'super_admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  if (session) {
    if (pathname.startsWith('/admin') && session.role !== 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    const fleetRoutes = ['/dashboard', '/vehicles', '/drivers', '/customers',
      '/bookings', '/trips', '/expenses', '/reports']
    if (fleetRoutes.some(r => pathname.startsWith(r)) && session.role === 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
