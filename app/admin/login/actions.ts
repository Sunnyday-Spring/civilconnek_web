'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'civilconnek1234'

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string

  if (!password || password.trim() !== ADMIN_PASSWORD) {
    return { error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' }
  }

  // ตั้งค่า Cookie Session หมดอายุใน 7 วัน
  const cookieStore = await cookies()
  cookieStore.set('civilconnek_admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 วัน
    path: '/',
  })

  redirect('/admin/projects')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('civilconnek_admin_session')
  redirect('/admin/login')
}
