'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/lib/supabase/types'
import { logoutAction } from '../login/actions'
import { getProjectsAction } from '../actions'
import {
  Building2,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Pencil,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Globe,
  LogOut,
  ClipboardList,
  Mail,
  Layers,
} from 'lucide-react'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState('ทั้งหมด')

  const loadProjects = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await getProjectsAction()
      if (!res.error) {
        setProjects(res.projects || [])
        setIsUsingFallback(false)
      } else {
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

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = selectedCat === 'ทั้งหมด' || p.category === selectedCat
    return matchesSearch && matchesCat
  })

  const categories = ['ทั้งหมด', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))]

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* 1. Header */}
      <nav className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="relative w-9 h-9 sm:w-10 sm:h-10 block shrink-0">
              <Image src="/logo.png" alt="โลโก้" fill sizes="40px" className="object-contain" />
            </Link>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base leading-tight">CIVIL CONNEK - ADMIN PANEL</h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">ระบบจัดการข้อมูลผลงานและโครงการ</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <Link href="/admin/queue" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition border border-amber-400/30 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>คิวงาน</span>
            </Link>
            <Link href="/admin/messages" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition border border-blue-400/30 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Mail className="w-3.5 h-3.5" />
              <span>ข้อความ</span>
            </Link>
            <Link href="/" target="_blank" className="bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition text-[11px] sm:text-xs flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>หน้าเว็บ</span>
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition font-bold text-[11px] sm:text-xs flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" />
                <span>ออก</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* 2. Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Error Banner */}
        {isUsingFallback && (
          <div className="mb-6 p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between text-amber-900 shadow-xs">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">การเชื่อมต่อ Supabase ขัดข้อง</h4>
                <p className="text-xs text-amber-800 mt-0.5 font-mono">
                  {errorMessage ? `สาเหตุ: ${errorMessage}` : 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'}
                </p>
              </div>
            </div>
            <button
              onClick={loadProjects}
              className="bg-amber-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-900 transition whitespace-nowrap flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ลองใหม่</span>
            </button>
          </div>
        )}

        {/* Header Controls & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">รายการผลงานทั้งหมด</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">จัดการ เพิ่ม แก้ไข หรือลบข้อมูลโครงการผลงานก่อสร้าง</p>
          </div>
          <Link
            href="/admin/projects/new"
            className="w-full sm:w-auto bg-[#1e90ff] hover:bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผลงานใหม่</span>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงการ หรือสถานที่..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  หมวดหมู่: {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200/80">
            <Loader2 className="w-8 h-8 text-[#1e90ff] animate-spin mx-auto mb-3" />
            <p className="text-slate-500 font-semibold text-sm">กำลังโหลดข้อมูลผลงาน...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-slate-200/80">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {searchQuery || selectedCat !== 'ทั้งหมด' ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีรายการผลงาน'}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6">
              {searchQuery || selectedCat !== 'ทั้งหมด' ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่' : 'เริ่มต้นเพิ่มผลงานแรกของ Civil Connek ได้ทันที'}
            </p>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-1.5 bg-[#1e90ff] text-white font-bold text-xs px-5 py-3 rounded-xl hover:bg-blue-600 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มผลงานใหม่</span>
            </Link>
          </div>
        ) : (
          <div>
            {/* Mobile Cards View (sm:hidden) */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <Image
                        src={project.cover_image || '/Project/hor-puk-chang-ton/complete.jpg'}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-[#0b4a74] rounded-md text-[10px] font-bold">
                        {project.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug truncate">{project.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>ปี {project.year}</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.photos?.length || 0} รูป</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Link
                      href={`/project/${project.id}`}
                      target="_blank"
                      className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl text-center transition flex items-center justify-center gap-1"
                    >
                      <span>ดูเว็บ</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      href={`/admin/projects/edit/${project.id}`}
                      className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl text-center transition flex items-center justify-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>แก้ไข</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      disabled={deletingId === project.id}
                      className="text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-xl text-center transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{deletingId === project.id ? 'ลบ...' : 'ลบ'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (hidden sm:block) */}
            <div className="hidden sm:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
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
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
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
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{project.location}</span>
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
                          <span className="inline-flex items-center gap-1">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                            <span>{project.photos?.length || 0} รูป</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/project/${project.id}`}
                              target="_blank"
                              className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition inline-flex items-center gap-1"
                            >
                              <span>ดูบนเว็บ</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            <Link
                              href={`/admin/projects/edit/${project.id}`}
                              className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition inline-flex items-center gap-1"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>แก้ไข</span>
                            </Link>
                            <button
                              onClick={() => handleDelete(project.id, project.title)}
                              disabled={deletingId === project.id}
                              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{deletingId === project.id ? 'ลบ...' : 'ลบ'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
