'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/lib/supabase/types'
import { FALLBACK_PROJECTS } from '@/lib/supabase/projects'
import { logoutAction } from '../login/actions'
import { getProjectsAction } from '../actions'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadProjects = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      // 1. Try fetching via Server Action (bypasses mobile Wi-Fi / CORS limitations)
      const res = await getProjectsAction()
      if (!res.error) {
        setProjects(res.projects || [])
        setIsUsingFallback(false)
      } else {
        // 2. Fallback to client fetching if server action returns an error
        const supabase = createClient()
        const { data, error } = await supabase
          .from('projects')
          .select('*, photos:project_photos(*)')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase fetch error:', error.message)
          setErrorMessage(error.message)
          setIsUsingFallback(true)
          setProjects([])
        } else {
          setProjects((data as Project[]) || [])
          setIsUsingFallback(false)
        }
      }
    } catch (err: any) {
      console.error('Load projects error:', err)
      setErrorMessage(err?.message || String(err))
      setIsUsingFallback(true)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`คุณต้องการลบผลงาน "${title}" ใช่หรือไม่?`)) return

    setDeletingId(id)
    try {
      const supabase = createClient()
      const { error } = await (supabase.from('projects') as any).delete().eq('id', id)

      if (error) {
        alert(`เกิดข้อผิดพลาดในการลบ: ${error.message}`)
      } else {
        alert('ลบผลงานเรียบร้อยแล้ว')
        setProjects(prev => prev.filter(p => p.id !== id))
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* 1. Header */}
      <nav className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="relative w-10 h-10 block">
              <Image src="/logo.png" alt="โลโก้" fill sizes="40px" className="object-contain" />
            </Link>
            <div>
              <h1 className="font-extrabold text-base leading-tight">CIVIL CONNEK - ADMIN PANEL</h1>
              <p className="text-[10px] text-slate-400 font-medium">ระบบจัดการข้อมูลผลงานและโครงการ</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link href="/admin/queue" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-4 py-2 rounded-lg transition border border-amber-400/30">
              📋 จัดคิวงานก่อสร้าง
            </Link>
            <Link href="/admin/messages" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition border border-blue-400/30">
              📩 ข้อความติดต่อจากลูกค้า
            </Link>
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

      {/* 2. Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* Banner แจ้งเตือนเมื่อเกิดข้อผิดพลาดในการเชื่อมต่อ Supabase */}
        {isUsingFallback && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-amber-900 shadow-sm">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-bold text-sm">การเชื่อมต่อ Supabase เกิดข้อผิดพลาดหรือขัดข้อง</h4>
                <p className="text-xs text-amber-800 mt-1 font-mono">
                  {errorMessage ? `สาเหตุ: ${errorMessage}` : 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือการตั้งค่า Supabase'}
                </p>
              </div>
            </div>
            <button
              onClick={loadProjects}
              className="bg-amber-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-amber-900 transition whitespace-nowrap"
            >
              🔄 ลองโหลดใหม่
            </button>
          </div>
        )}

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">รายการผลงานทั้งหมด</h2>
            <p className="text-slate-500 text-sm mt-1">จัดการ เพิ่ม แก้ไข หรือลบข้อมูลโครงการผลงานก่อสร้าง</p>
          </div>
          <Link
            href="/admin/projects/new"
            className="bg-[#1e90ff] hover:bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> เพิ่มผลงานใหม่
          </Link>
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80">
            <div className="inline-block animate-spin text-3xl mb-3">🌀</div>
            <p className="text-slate-500 font-semibold text-sm">กำลังโหลดข้อมูลผลงาน...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80">
            <div className="text-4xl mb-3">🏗️</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มีรายการผลงาน</h3>
            <p className="text-slate-500 text-sm mb-6">เริ่มต้นเพิ่มผลงานแรกของ Civil Connek ได้ทันที</p>
            <Link
              href="/admin/projects/new"
              className="bg-[#1e90ff] text-white font-bold text-xs px-5 py-3 rounded-xl hover:bg-blue-600 transition"
            >
              + เพิ่มผลงานใหม่
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">รูปปก</th>
                    <th className="py-4 px-6">ชื่อโครงการ / สถานที่</th>
                    <th className="py-4 px-6">หมวดหมู่</th>
                    <th className="py-4 px-6">ปีที่ดำเนินการ</th>
                    <th className="py-4 px-6">จำนวนรูปขั้นตอน</th>
                    <th className="py-4 px-6 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                          <Image
                            src={project.cover_image || '/Project/hor-puk-chang-ton/complete.jpg'}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-base">{project.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>📍 {project.location}</span>
                          <span>•</span>
                          <span>{project.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-[#0b4a74] rounded-full text-xs font-bold">
                          {project.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">{project.year}</td>
                      <td className="py-4 px-6 font-semibold text-slate-600">
                        📸 {project.photos?.length || 0} รูป
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/project/${project.id}`}
                            target="_blank"
                            className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition"
                          >
                            ดูบนเว็บ ↗
                          </Link>
                          <button
                            onClick={() => handleDelete(project.id, project.title)}
                            disabled={deletingId === project.id}
                            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition disabled:opacity-50"
                          >
                            {deletingId === project.id ? 'กำลังลบ...' : '🗑️ ลบ'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
