import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CIVIL CONNEK - ADMIN PORTAL',
  description: 'ระบบควบคุมและจัดการหลังบ้าน บริษัท ซีวิล คอนเนค จำกัด',
  manifest: '/admin-manifest.json',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
