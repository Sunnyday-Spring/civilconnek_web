'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { loginAction } from './actions'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1e90ff]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0b4a74]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 text-slate-900">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block relative w-16 h-16 mb-4">
            <Image src="/logo.png" alt="โลโก้ CIVIL CONNEK" fill sizes="64px" className="object-contain" priority />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">CIVIL CONNEK</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">ระบบเข้าสู่ระบบผู้ดูแลระบบ (Admin Login)</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              รหัสผ่านเข้าใช้งาน (Password)
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="กรอกรหัสผ่าน..."
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 pr-12 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
              >
                {showPassword ? '👁️ ซ่อน' : '👁️ แสดง'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#1e90ff] hover:bg-blue-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-base">🌀</span> กำลังตรวจสอบรหัสผ่าน...
              </>
            ) : (
              'เข้าสู่ระบบ (Sign In)'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link href="/" className="inline-block text-xs font-bold text-slate-400 hover:text-[#1e90ff] transition">
            ← กลับสู่หน้าหลักเว็บไซต์
          </Link>
        </div>
      </div>
    </div>
  )
}
