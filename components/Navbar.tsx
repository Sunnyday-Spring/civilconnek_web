'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Phone as PhoneIcon,
  Menu as MenuIcon,
  X as XIcon,
  Home as HomeNavIcon,
  Wrench as WrenchIcon,
  Building2 as BuildingIcon,
  Activity as ActivityIcon,
  Mail as MailIcon,
  ChevronRight as ChevronRightIcon,
  MessageSquare as MessageIcon,
} from 'lucide-react'

interface NavbarProps {
  activeTab?: string
}

export default function Navbar({ activeTab = 'home' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group" onClick={closeMenu}>
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 transition-transform group-hover:scale-105">
            <Image src="/logo.png" alt="โลโก้ บริษัท ซีวิล คอนเนค จำกัด" fill sizes="44px" className="object-contain" priority />
          </div>
          <div className="flex flex-col">
            <h1 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
              CIVIL CONNEK
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-500 tracking-wider font-bold uppercase leading-none mt-0.5">
              บริษัท ซีวิล คอนเนค จำกัด
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-[#0b4a74] transition-colors py-1">
            หน้าแรก
          </Link>
          <Link href="/#services" className="hover:text-[#0b4a74] transition-colors py-1">
            บริการของเรา
          </Link>
          <Link href="/#projects" className="hover:text-[#0b4a74] transition-colors py-1">
            ผลงาน
          </Link>
          <Link href="/#queue" className="hover:text-[#0b4a74] transition-colors py-1">
            สถานะไซต์งาน
          </Link>
          <Link href="/#contact" className="hover:text-[#0b4a74] transition-colors py-1">
            ติดต่อสอบถาม
          </Link>
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:0982192091"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition"
          >
            <PhoneIcon className="w-3.5 h-3.5 text-[#0b4a74]" />
            <span>098-219-2091</span>
          </a>
          <Link
            href="/#contact"
            className="bg-[#0b4a74] hover:bg-[#1e90ff] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm hover:shadow-md"
          >
            ติดต่อเรา
          </Link>
        </div>

        {/* Mobile Right Action Area */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="tel:0982192091"
            className="w-9 h-9 rounded-xl bg-blue-50 text-[#0b4a74] flex items-center justify-center active:scale-95 transition"
            aria-label="โทรสอบถาม"
          >
            <PhoneIcon className="w-4 h-4" />
          </a>

          {/* Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-slate-100 active:bg-slate-200 flex justify-center items-center transition text-slate-800 focus:outline-none"
            aria-label="เปิดเมนู"
          >
            {mobileMenuOpen ? <XIcon className="w-5 h-5 text-slate-800" /> : <MenuIcon className="w-5 h-5 text-slate-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[61px] bottom-0 bg-slate-950/70 backdrop-blur-md z-40 animate-fade-in flex flex-col justify-between p-4 sm:p-5 border-t border-slate-200/20">
          <div className="bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-100">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">
              เมนูแนะนำ
            </p>
            <div className="flex flex-col gap-1 text-slate-800 font-bold text-sm">
              <Link
                href="/"
                onClick={closeMenu}
                className="px-3.5 py-3 rounded-2xl hover:bg-slate-50 active:bg-blue-50 active:text-[#0b4a74] transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b4a74]">
                    <HomeNavIcon className="w-4 h-4" />
                  </div>
                  <span>หน้าแรก</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/#services"
                onClick={closeMenu}
                className="px-3.5 py-3 rounded-2xl hover:bg-slate-50 active:bg-blue-50 active:text-[#0b4a74] transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b4a74]">
                    <WrenchIcon className="w-4 h-4" />
                  </div>
                  <span>บริการของเรา</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/#projects"
                onClick={closeMenu}
                className="px-3.5 py-3 rounded-2xl hover:bg-slate-50 active:bg-blue-50 active:text-[#0b4a74] transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b4a74]">
                    <BuildingIcon className="w-4 h-4" />
                  </div>
                  <span>ผลงานโครงการ</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/#queue"
                onClick={closeMenu}
                className="px-3.5 py-3 rounded-2xl hover:bg-slate-50 active:bg-blue-50 active:text-[#0b4a74] transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b4a74]">
                    <ActivityIcon className="w-4 h-4" />
                  </div>
                  <span>สถานะไซต์งาน (Live Tracker)</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/#contact"
                onClick={closeMenu}
                className="px-3.5 py-3 rounded-2xl hover:bg-slate-50 active:bg-blue-50 active:text-[#0b4a74] transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#0b4a74]">
                    <MailIcon className="w-4 h-4" />
                  </div>
                  <span>ติดต่อสอบถาม</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <a
                href="tel:0982192091"
                onClick={closeMenu}
                className="w-full py-3.5 bg-[#0b4a74] text-white rounded-2xl text-center font-bold text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2"
              >
                <PhoneIcon className="w-4 h-4" />
                <span>โทรสอบถาม: 098-219-2091</span>
              </a>
              <Link
                href="/#contact"
                onClick={closeMenu}
                className="w-full py-3.5 bg-blue-50 text-[#0b4a74] border border-blue-200 rounded-2xl text-center font-bold text-sm active:scale-98 transition flex items-center justify-center gap-2"
              >
                <MessageIcon className="w-4 h-4" />
                <span>ฝากข้อความประเมินราคา</span>
              </Link>
            </div>
          </div>

          <div className="text-center py-3 text-xs text-slate-300 font-medium">
            © บริษัท ซีวิล คอนเนค จำกัด
          </div>
        </div>
      )}
    </nav>
  )
}
