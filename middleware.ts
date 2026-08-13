import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const adminSession = request.cookies.get('civilconnek_admin_session')

  // ป้องกันทุกหน้า /admin (ยกเว้น /admin/login) หากยังไม่ได้ Login ให้ไปหน้า /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !adminSession?.value) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // ถ้า Login แล้วแต่เข้าหน้า /admin/login ให้ย้ายไปหน้าหลังบ้านหลัก /admin
  if (pathname === '/admin/login' && adminSession?.value) {
    const adminUrl = new URL('/admin', request.url)
    return NextResponse.redirect(adminUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
