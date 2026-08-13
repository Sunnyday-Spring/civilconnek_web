'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { logoutAction } from './login/actions'

export default function AdminHubPage() {
  const [projectsCount, setProjectsCount] = useState<number>(0)
  const [queueCount, setQueueCount] = useState<number>(0)
  const [newMessagesCount, setNewMessagesCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      try {
        const supabase = createClient()

        // 1. Projects count
        const { count: pCount } = await (supabase.from('projects') as any)
          .select('*', { count: 'exact', head: true })
        setProjectsCount(pCount || 0)

        // 2. Queue count
        const { count: qCount } = await (supabase.from('construction_queue') as any)
          .select('*', { count: 'exact', head: true })
        setQueueCount(qCount || 0)

        // 3. New messages count
        const { count: mCount } = await (supabase.from('contact_messages') as any)
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new')
        setNewMessagesCount(mCount || 0)
      } catch (err) {
        console.error('Error loading stats:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="relative w-10 h-10 block">
              <Image src="/logo.png" alt="โลโก้" fill sizes="40px" className="object-contain" />
            </Link>
            <div>
              <h1 className="font-extrabold text-base leading-tight">CIVIL CONNEK - ADMIN PORTAL</h1>
              <p className="text-[10px] text-slate-400 font-medium">ระบบควบคุมและจัดการหลังบ้าน</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link href="/" target="_blank" className="bg-white/10 hover:bg-white/20 text-slate-200 px-4 py-2 rounded-lg transition">
              🌐 ดูหน้าเว็บไซต์จริง ↗
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3.5 py-2 rounded-lg transition font-bold">
                🚪 ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0b4a74] to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none">
            <Image src="/logo.png" alt="โลโก้" width={300} height={300} />
          </div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 bg-[#1e90ff]/20 text-[#1e90ff] rounded-full text-xs font-bold uppercase tracking-wider">
              ADMIN DASHBOARD HUB
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              ยินดีต้อนรับสู่ศูนย์ควบคุมระบบหลังบ้าน
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed">
              เลือกเมนูด้านล่างเพื่อจัดการข้อมูลผลงานโครงการ, จัดคิวงานก่อสร้าง หรือตรวจสอบข้อความติดต่อจากลูกค้า
            </p>
          </div>
        </div>

        {/* Function Shortcut Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Card 1: จัดการผลงานโครงการ */}
          <Link
            href="/admin/projects"
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0b4a74] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🏗️
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#1e90ff] transition">
                  จัดการผลงานโครงการ
                </h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">
                  ดูรายการผลงาน เพิ่มโครงการใหม่ อัปโหลดรูปปก รูปอัลบั้มขั้นตอนงาน หรือลบผลงานเก่า
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">
                {loading ? '...' : `${projectsProjectsText(projectsCount)}`}
              </span>
              <span className="text-xs font-extrabold text-[#1e90ff] group-hover:translate-x-1 transition-transform">
                เข้าสู่หน้าจัดการ →
              </span>
            </div>
          </Link>

          {/* Card 2: จัดคิวและติดตามงานก่อสร้าง */}
          <Link
            href="/admin/queue"
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📋
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#1e90ff] transition">
                  จัดคิวงานก่อสร้าง (Queue Tracker)
                </h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">
                  จัดลำดับคิวไซต์งาน ปรับเปอร์เซ็นต์ความคืบหน้าก่อสร้าง (%) และแสดงสถานะแบบเรียลไทม์
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">
                {loading ? '...' : `${queueCount} รายการคิวงาน`}
              </span>
              <span className="text-xs font-extrabold text-[#1e90ff] group-hover:translate-x-1 transition-transform">
                เข้าสู่ระบบคิวงาน →
              </span>
            </div>
          </Link>

          {/* Card 3: ข้อความติดต่อจากลูกค้า */}
          <Link
            href="/admin/messages"
            className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
          >
            {newMessagesCount > 0 && (
              <div className="absolute top-6 right-6 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-extrabold animate-bounce">
                🔴 {newMessagesCount} ใหม่
              </div>
            )}
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📩
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#1e90ff] transition">
                  ข้อความติดต่อจากลูกค้า (Inbox)
                </h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">
                  ตรวจสอบรายชื่อผู้ติดต่อ เบอร์โทรศัพท์ และรายละเอียดที่ต้องการให้ประเมินราคา
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">
                {loading ? '...' : `${newMessagesCount} ข้อความใหม่`}
              </span>
              <span className="text-xs font-extrabold text-[#1e90ff] group-hover:translate-x-1 transition-transform">
                ดูข้อความติดต่อ →
              </span>
            </div>
          </Link>

          {/* Card 4: เพิ่มผลงานใหม่ด่วน */}
          <Link
            href="/admin/projects/new"
            className="bg-gradient-to-br from-[#1e90ff] to-blue-700 rounded-3xl p-8 text-white shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between md:col-span-2 lg:col-span-3"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-extrabold">
                  + QUICK ACTION
                </span>
                <h3 className="text-2xl font-black">เปิดฟอร์มเพิ่มผลงานใหม่ทันที</h3>
                <p className="text-blue-100 text-xs font-medium max-w-xl">
                  กรอกข้อมูลรายละเอียดผลงาน เลือกรูปปก และอัปโหลดรูปขั้นตอนการดำเนินงานขึ้นระบบ Supabase
                </p>
              </div>
              <span className="bg-white text-[#0b4a74] px-6 py-3.5 rounded-2xl font-black text-sm group-hover:bg-slate-900 group-hover:text-white transition whitespace-nowrap shadow-md">
                + เพิ่มผลงานใหม่ →
              </span>
            </div>
          </Link>

        </div>
      </main>
    </div>
  )
}

function projectsProjectsText(count: number) {
  return `${count} ผลงานโครงการ`
}
