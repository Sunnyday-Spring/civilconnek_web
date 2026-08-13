'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ContactMessage } from '@/lib/supabase/types'
import { logoutAction } from '../login/actions'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadMessages = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await (supabase
        .from('contact_messages') as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setMessages(data as ContactMessage[])
      }
    } catch (err) {
      console.error('Fetch messages error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'new' ? 'contacted' : 'new'
    setUpdatingId(id)
    try {
      const supabase = createClient()
      const { error } = await (supabase
        .from('contact_messages') as any)
        .update({ status: nextStatus })
        .eq('id', id)

      if (!error) {
        setMessages(prev =>
          prev.map(m => (m.id === id ? { ...m, status: nextStatus as any } : m))
        )
      } else {
        alert(`อัปเดตสถานะไม่สำเร็จ: ${error.message}`)
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบข้อความจากคุณ "${name}" ใช่หรือไม่?`)) return

    setUpdatingId(id)
    try {
      const supabase = createClient()
      const { error } = await (supabase
        .from('contact_messages') as any)
        .delete()
        .eq('id', id)

      if (!error) {
        setMessages(prev => prev.filter(m => m.id !== id))
      } else {
        alert(`เกิดข้อผิดพลาดในการลบ: ${error.message}`)
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredMessages = messages.filter(m => {
    if (filter === 'new') return m.status === 'new'
    if (filter === 'contacted') return m.status === 'contacted'
    return true
  })

  const newCount = messages.filter(m => m.status === 'new').length
  const contactedCount = messages.filter(m => m.status === 'contacted').length

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
              <p className="text-[10px] text-slate-400 font-medium">กล่องข้อความติดต่อจากลูกค้า (Inbox)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link href="/admin/projects" className="bg-white/10 hover:bg-white/20 text-slate-200 px-4 py-2 rounded-lg transition">
              🏗️ รายการผลงาน
            </Link>
            <Link href="/" target="_blank" className="bg-white/10 hover:bg-white/20 text-slate-200 px-4 py-2 rounded-lg transition">
              🌐 หน้าเว็บจริง ↗
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">ข้อความติดต่อจากลูกค้า</h2>
            <p className="text-slate-500 text-sm mt-1">รายชื่อผู้ติดต่อสอบถามโครงการหรือขอใบเสนอราคา</p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1 text-xs font-bold shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl transition ${filter === 'all' ? 'bg-[#0b4a74] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              ทั้งหมด ({messages.length})
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${filter === 'new' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span>🔴</span> มาใหม่ ({newCount})
            </button>
            <button
              onClick={() => setFilter('contacted')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${filter === 'contacted' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span>🟢</span> ติดต่อแล้ว ({contactedCount})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80">
            <div className="inline-block animate-spin text-3xl mb-3">🌀</div>
            <p className="text-slate-500 font-semibold text-sm">กำลังโหลดข้อความติดต่อ...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80">
            <div className="text-4xl mb-3">📬</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มีข้อความในหมวดหมู่นี้</h3>
            <p className="text-slate-500 text-sm">เมื่อมีผู้สนใจกรอกฟอร์มติดต่อสอบถาม ข้อความจะมาปรากฏที่นี่ทันที</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg) => {
              const dateStr = new Date(msg.created_at).toLocaleString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              const isNew = msg.status === 'new'

              return (
                <div
                  key={msg.id}
                  className={`bg-white rounded-3xl p-6 md:p-8 border shadow-sm transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                    isNew ? 'border-red-200 bg-red-50/20' : 'border-slate-200/80'
                  }`}
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        isNew ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isNew ? '🔴 มาใหม่' : '🟢 ติดต่อแล้ว'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">🕒 {dateStr}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <h3 className="text-xl font-bold text-slate-900">👤 {msg.name}</h3>
                      <a
                        href={`tel:${msg.phone}`}
                        className="text-base font-extrabold text-[#1e90ff] hover:underline flex items-center gap-1.5"
                      >
                        📞 {msg.phone}
                      </a>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed font-medium">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">รายละเอียดที่สนใจ / โครงการ:</p>
                      {msg.detail || 'ไม่ได้ระบุรายละเอียดเพิ่มเติม'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => toggleStatus(msg.id, msg.status)}
                      disabled={updatingId === msg.id}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isNew
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isNew ? '✓ ทำเครื่องหมายว่าติดต่อแล้ว' : '↩ ทำเครื่องหมายว่ามาใหม่'}
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id, msg.name)}
                      disabled={updatingId === msg.id}
                      className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition"
                      title="ลบข้อความนี้"
                    >
                      🗑️ ลบ
                    </button>
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
