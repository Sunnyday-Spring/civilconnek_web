'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { QueueItem } from '@/lib/supabase/types'
import { logoutAction } from '../login/actions'

export default function AdminQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<'queued' | 'in_progress' | 'completed' | 'paused'>('queued')
  const [progressPercent, setProgressPercent] = useState(0)

  const loadQueue = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await (supabase
        .from('construction_queue') as any)
        .select('*')
        .order('queue_order', { ascending: true })

      if (!error && data) {
        setQueue(data as QueueItem[])
      }
    } catch (err) {
      console.error('Fetch queue error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQueue()
  }, [])

  const handleAddQueue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName.trim() || !clientName.trim() || !location.trim()) {
      alert('กรุณากรอกชื่อโครงการ ชื่อลูกค้า และสถานที่ก่อสร้าง')
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const nextOrder = queue.length + 1
      const { data, error } = await (supabase
        .from('construction_queue') as any)
        .insert({
          project_name: projectName.trim(),
          client_name: clientName.trim(),
          location: location.trim(),
          start_date: startDate.trim() || null,
          estimated_end_date: endDate.trim() || null,
          status,
          progress_percent: Number(progressPercent) || 0,
          queue_order: nextOrder,
        })
        .select()
        .single()

      if (error) {
        alert(`เพิ่มคิวงานไม่สำเร็จ: ${error.message}`)
      } else {
        alert('🎉 เพิ่มคิวงานก่อสร้างเรียบร้อยแล้ว!')
        setQueue(prev => [...prev, data as QueueItem])
        setShowAddForm(false)
        setProjectName('')
        setClientName('')
        setLocation('')
        setStartDate('')
        setEndDate('')
        setProgressPercent(0)
        setStatus('queued')
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string, newProgress?: number) => {
    try {
      const supabase = createClient()
      const updateData: any = { status: newStatus }
      if (newProgress !== undefined) {
        updateData.progress_percent = newProgress
      } else if (newStatus === 'completed') {
        updateData.progress_percent = 100
      }

      const { error } = await (supabase
        .from('construction_queue') as any)
        .update(updateData)
        .eq('id', id)

      if (!error) {
        setQueue(prev =>
          prev.map(q => (q.id === id ? { ...q, ...updateData } : q))
        )
      } else {
        alert(`อัปเดตสถานะไม่สำเร็จ: ${error.message}`)
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    }
  }

  const handleProgressChange = async (id: string, percent: number) => {
    try {
      const supabase = createClient()
      const newStatus = percent === 100 ? 'completed' : percent > 0 ? 'in_progress' : 'queued'
      const { error } = await (supabase
        .from('construction_queue') as any)
        .update({ progress_percent: percent, status: newStatus })
        .eq('id', id)

      if (!error) {
        setQueue(prev =>
          prev.map(q => (q.id === id ? { ...q, progress_percent: percent, status: newStatus as any } : q))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบคิวงาน "${name}" ใช่หรือไม่?`)) return

    try {
      const supabase = createClient()
      const { error } = await (supabase
        .from('construction_queue') as any)
        .delete()
        .eq('id', id)

      if (!error) {
        setQueue(prev => prev.filter(q => q.id !== id))
      } else {
        alert(`เกิดข้อผิดพลาดในการลบ: ${error.message}`)
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    }
  }

  const inProgressQueue = queue.filter(q => q.status === 'in_progress')
  const upcomingQueue = queue.filter(q => q.status === 'queued')
  const completedQueue = queue.filter(q => q.status === 'completed')

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="relative w-10 h-10 block">
              <Image src="/logo.png" alt="โลโก้" fill sizes="40px" className="object-contain" />
            </Link>
            <div>
              <h1 className="font-extrabold text-base leading-tight">CIVIL CONNEK - ADMIN PANEL</h1>
              <p className="text-[10px] text-slate-400 font-medium">ระบบจัดคิวและติดตามงานก่อสร้าง (Construction Queue)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link href="/admin/projects" className="bg-white/10 hover:bg-white/20 text-slate-200 px-4 py-2 rounded-lg transition">
              🏗️ รายการผลงาน
            </Link>
            <Link href="/admin/messages" className="bg-white/10 hover:bg-white/20 text-slate-200 px-4 py-2 rounded-lg transition">
              📩 ข้อความติดต่อ
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
        {/* Top Controls & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">คิวงานก่อสร้างทั้งหมด</h2>
            <p className="text-slate-500 text-sm mt-1">จัดลำดับ ติดตามสถานะไซต์งาน และอัปเดตความคืบหน้าก่อสร้าง</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#1e90ff] hover:bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> {showAddForm ? 'ซ่อนฟอร์ม' : 'เพิ่มคิวงานก่อสร้างใหม่'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold">
              ⏳
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">รอคิวเริ่มงาน</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{upcomingQueue.length} <span className="text-xs text-slate-500 font-semibold">โครงการ</span></h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1e90ff] flex items-center justify-center text-2xl font-bold">
              🏗️
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">กำลังดำเนินการสร้าง</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{inProgressQueue.length} <span className="text-xs text-slate-500 font-semibold">ไซต์งาน</span></h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
              ✅
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">เสร็จสิ้นแล้ว</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{completedQueue.length} <span className="text-xs text-slate-500 font-semibold">โครงการ</span></h3>
            </div>
          </div>
        </div>

        {/* Add Form Panel */}
        {showAddForm && (
          <div className="bg-white rounded-3xl p-8 border border-blue-200 shadow-lg mb-8 space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
              <span>🏗️</span> เพิ่มคิวงานก่อสร้างใหม่ (New Construction Job)
            </h3>

            <form onSubmit={handleAddQueue} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  ชื่อโครงการ / ไซต์งาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น บ้านพักอาศัย 2 ชั้น คุณสมชาย"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  ชื่อลูกค้า / เจ้าของงาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณสมชาย (081-xxx-xxxx)"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  สถานที่ก่อสร้าง / จังหวัด <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อ.เมือง จ.เชียงราย"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  สถานะเริ่มต้น
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff]"
                >
                  <option value="queued">⏳ รอคิวเริ่มงาน (Queued)</option>
                  <option value="in_progress">🏗️ กำลังดำเนินการก่อสร้าง (In Progress)</option>
                  <option value="completed">✅ แล้วเสร็จ (Completed)</option>
                  <option value="paused">⏸️ ชะลอโครงการ (Paused)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  วันเริ่มงาน / สัญญา
                </label>
                <input
                  type="text"
                  placeholder="เช่น ม.ค. 2026"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  คาดว่าแล้วเสร็จ
                </label>
                <input
                  type="text"
                  placeholder="เช่น ก.ย. 2026"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    ความคืบหน้าเริ่มต้น (%)
                  </label>
                  <span className="text-sm font-extrabold text-[#1e90ff]">{progressPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={e => setProgressPercent(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1e90ff]"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-[#1e90ff] text-white font-extrabold text-xs rounded-xl hover:bg-blue-600 transition shadow-md disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : '💾 บันทึกคิวงานใหม่'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Queue List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80">
            <div className="inline-block animate-spin text-3xl mb-3">🌀</div>
            <p className="text-slate-500 font-semibold text-sm">กำลังโหลดรายการคิวงาน...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มีคิวงานก่อสร้างในระบบ</h3>
            <p className="text-slate-500 text-sm mb-6">เริ่มต้นเพิ่มคิวงานแรกเพื่อติดตามสถานะก่อสร้าง</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#1e90ff] text-white font-bold text-xs px-5 py-3 rounded-xl hover:bg-blue-600 transition"
            >
              + เพิ่มคิวงานก่อสร้างใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {queue.map((item, idx) => {
              const statusBadge =
                item.status === 'in_progress'
                  ? { label: '🏗️ กำลังดำเนินการสร้าง', style: 'bg-blue-100 text-[#0b4a74]' }
                  : item.status === 'completed'
                  ? { label: '✅ แล้วเสร็จเรียบร้อย', style: 'bg-emerald-100 text-emerald-800' }
                  : item.status === 'paused'
                  ? { label: '⏸️ ชะลอโครงการ', style: 'bg-amber-100 text-amber-800' }
                  : { label: '⏳ รอคิวเริ่มงาน', style: 'bg-slate-100 text-slate-700' }

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm transition space-y-6"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{item.project_name}</h3>
                        <p className="text-xs text-slate-500 font-medium">📍 {item.location} · 👤 {item.client_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={item.status}
                        onChange={e => handleUpdateStatus(item.id, e.target.value)}
                        className={`text-xs font-extrabold px-4 py-2 rounded-xl border border-transparent focus:outline-none ${statusBadge.style}`}
                      >
                        <option value="queued">⏳ รอคิวเริ่มงาน</option>
                        <option value="in_progress">🏗️ กำลังดำเนินการสร้าง</option>
                        <option value="completed">✅ แล้วเสร็จเรียบร้อย</option>
                        <option value="paused">⏸️ ชะลอโครงการ</option>
                      </select>

                      <button
                        onClick={() => handleDelete(item.id, item.project_name)}
                        className="p-2 text-red-500 hover:text-red-700 text-sm"
                        title="ลบคิวนี้"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar Control */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                        ความคืบหน้าโครงการ (Progress)
                      </span>
                      <span className="text-sm font-black text-[#1e90ff]">{item.progress_percent}%</span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-[#0b4a74] to-[#1e90ff] rounded-full transition-all duration-500"
                        style={{ width: `${item.progress_percent}%` }}
                      />
                    </div>

                    {/* Quick percentage buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">ปรับด่วน:</span>
                      {[0, 25, 50, 75, 100].map(pct => (
                        <button
                          key={pct}
                          onClick={() => handleProgressChange(item.id, pct)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            item.progress_percent === pct
                              ? 'bg-[#1e90ff] text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Details Timeline Dates */}
                  <div className="flex flex-wrap gap-6 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 font-bold">วันเริ่มงาน:</span>{' '}
                      <span className="font-semibold">{item.start_date || 'ไม่ได้ระบุ'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">คาดว่าจะเสร็จ:</span>{' '}
                      <span className="font-semibold">{item.estimated_end_date || 'ไม่ได้ระบุ'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
