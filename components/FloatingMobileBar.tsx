'use client'

import Link from 'next/link'
import { Phone, MessageSquare, Building2, Activity } from 'lucide-react'

export default function FloatingMobileBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.25)]">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center">
        {/* Phone Button */}
        <a
          href="tel:0982192091"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-300 active:bg-blue-600 active:text-white transition group"
        >
          <Phone className="w-5 h-5 text-blue-400 group-active:text-white transition-colors" />
          <span className="text-[10px] font-bold mt-1 text-blue-400 group-active:text-white">โทรสายด่วน</span>
        </a>

        {/* Contact Form Link */}
        <Link
          href="/#contact"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-300 active:bg-slate-800 transition group"
        >
          <MessageSquare className="w-5 h-5 text-slate-400 group-active:text-white transition-colors" />
          <span className="text-[10px] font-bold mt-1">ส่งข้อความ</span>
        </Link>

        {/* Projects Link */}
        <Link
          href="/#projects"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-300 active:bg-slate-800 transition group"
        >
          <Building2 className="w-5 h-5 text-slate-400 group-active:text-white transition-colors" />
          <span className="text-[10px] font-bold mt-1">ดูผลงาน</span>
        </Link>

        {/* Live Queue Tracker Link */}
        <Link
          href="/#queue"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-300 active:bg-slate-800 transition group"
        >
          <Activity className="w-5 h-5 text-slate-400 group-active:text-white transition-colors" />
          <span className="text-[10px] font-bold mt-1">สถานะคิว</span>
        </Link>
      </div>
    </div>
  )
}
