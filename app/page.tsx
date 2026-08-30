'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import FloatingMobileBar from '@/components/FloatingMobileBar'
import { fetchProjects, fetchQueue } from '@/lib/supabase/projects'
import { Project, QueueItem } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'

import {
  Compass,
  Building2,
  HardHat,
  Home as HomeIcon,
  ClipboardCheck,
  Phone,
  Mail,
  MapPin,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Loader2,
  Send,
  Award,
  Calendar,
  Users,
  Smile,
} from 'lucide-react'

function DrawBorderCard({ children, className = '', href = '/services' }: {
  children: React.ReactNode
  className?: string
  href?: string
}) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const rectRef = useRef<SVGRectElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const rect = rectRef.current
    if (!card || !rect) return

    const updatePerimeter = () => {
      const w = card.offsetWidth - 2
      const h = card.offsetHeight - 2
      const r = 15
      const perimeter = Math.round(2 * (w + h) - (8 - 2 * Math.PI) * r)
      rect.style.strokeDasharray = `${perimeter}`
      rect.style.strokeDashoffset = `${perimeter}`
      rect.setAttribute('width', String(w))
      rect.setAttribute('height', String(h))
    }

    const handleMouseEnter = () => {
      rect.style.strokeDashoffset = '0'
      card.style.backgroundColor = '#0b4a74'
      card.style.color = '#ffffff'
    }
    const handleMouseLeave = () => {
      rect.style.strokeDashoffset = rect.style.strokeDasharray
      card.style.backgroundColor = '#ffffff'
      card.style.color = ''
    }

    const ro = new ResizeObserver(updatePerimeter)
    ro.observe(card)
    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      ro.disconnect()
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <Link
      href={href}
      ref={cardRef}
      className={`relative bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl group hover:-translate-y-1 hover:shadow-xl block active:scale-[0.99] transition-all duration-300 ${className}`}
      style={{ transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease' }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e90ff" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#1e90ff" />
          </linearGradient>
        </defs>
        <rect
          ref={rectRef}
          x="1" y="1" rx="15"
          fill="none"
          stroke="url(#card-grad)"
          strokeWidth="2"
          style={{ transition: 'stroke-dashoffset 0.75s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {children}
    </Link>
  )
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [queues, setQueues] = useState<QueueItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด')

  // Contact Form State
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactDetail, setContactDetail] = useState('')
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)

  useEffect(() => {
    fetchProjects().then(setProjects)
    fetchQueue().then(setQueues)
  }, [])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactName.trim() || !contactPhone.trim()) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์สำหรับติดต่อกลับ')
      return
    }

    setContactSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await (supabase.from('contact_messages') as any).insert({
        name: contactName.trim(),
        phone: contactPhone.trim(),
        detail: contactDetail.trim(),
        status: 'new',
      })

      if (error) {
        alert(`ส่งข้อมูลไม่สำเร็จ: ${error.message}`)
      } else {
        setContactSuccess(true)
        setContactName('')
        setContactPhone('')
        setContactDetail('')
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setContactSubmitting(false)
    }
  }

  // Filter projects by category
  const categories = ['ทั้งหมด', 'งานสถาปัตยกรรม', 'งานโครงสร้าง', 'งานอาคารพักอาศัย', 'งานปรับปรุงรีโนเวท']
  const filteredProjects = selectedCategory === 'ทั้งหมด'
    ? projects
    : projects.filter(p => p.category?.toLowerCase().includes(selectedCategory.toLowerCase()) || p.type?.toLowerCase().includes(selectedCategory.toLowerCase()))

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-16 md:pb-0">
      {/* 1. NAVIGATION BAR */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <section className="relative min-h-[85vh] py-16 md:py-24 bg-slate-900 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/hero-bg.jpg" alt="หน้าไซต์งานก่อสร้าง" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/40" />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-3xl space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1e90ff]/20 text-[#1e90ff] border border-[#1e90ff]/30 rounded-full text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#1e90ff] animate-pulse" />
              ผู้เชี่ยวชาญด้านงานก่อสร้างและวิศวกรรม
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight md:leading-[1.1]">
              สร้างสรรค์ <span className="text-[#1e90ff]">โครงสร้าง</span> <br className="hidden sm:inline" />สู่อนาคตที่ยั่งยืน
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-light max-w-2xl leading-relaxed">
              บริการออกแบบและรับเหมาก่อสร้างครบวงจร โดยทีมวิศวกรและสถาปนิกมืออาชีพ
              มุ่งเน้นคุณภาพ มาตรฐานวิศวกรรม และความพึงพอใจของลูกค้าเป็นสำคัญ
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Link
                href="#projects"
                className="bg-[#1e90ff] text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg text-center hover:bg-blue-600 shadow-lg hover:shadow-[#1e90ff]/40 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <Building2 className="w-5 h-5" />
                <span>ชมผลงานของเรา</span>
              </Link>
              <a
                href="tel:0982192091"
                className="bg-emerald-600 sm:bg-white/10 sm:backdrop-blur-md text-white border border-emerald-500 sm:border-white/30 px-8 py-4 rounded-xl font-bold text-base sm:text-lg text-center hover:bg-white/20 transition active:scale-98 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                <span>โทรสอบถาม: 098-219-2091</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATISTICS */}
      <div className="bg-white py-10 sm:py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {[
            { label: 'โครงการที่สำเร็จ', value: '30+', icon: Award },
            { label: 'ประสบการณ์ (ปี)', value: '12+', icon: Calendar },
            { label: 'ทีมวิศวกรเชี่ยวชาญ', value: '45+', icon: Users },
            { label: 'ความพึงพอใจลูกค้า', value: '100%', icon: Smile },
          ].map((stat, i) => {
            const IconComp = stat.icon
            return (
              <div key={i} className="text-center p-4 rounded-2xl bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-100 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0b4a74] flex items-center justify-center mb-2">
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0b4a74] mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wide">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. SERVICES */}
      <section id="services" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h3 className="text-[#1e90ff] font-bold tracking-[0.3em] text-xs sm:text-sm uppercase mb-3">OUR SERVICES</h3>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900">บริการที่เชี่ยวชาญ</h2>
            <div className="w-12 h-1 bg-[#0b4a74] mx-auto mt-4 rounded-full" />
          </div>

          {/* Featured 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {[
              { title: 'งานออกแบบสถาปัตยกรรม', icon: Compass, desc: 'ออกแบบบ้าน อาคารสำนักงาน และโครงการอสังหาริมทรัพย์ที่ตอบโจทย์การใช้งาน ด้วยทีมสถาปนิกมืออาชีพและซอฟต์แวร์ออกแบบระดับสากล' },
              { title: 'งานวิศวกรรมโครงสร้าง', icon: Building2, desc: 'ควบคุมการก่อสร้างและคำนวณโครงสร้างตามมาตรฐานวิศวกรรมที่ปลอดภัย โดยทีมวิศวกรที่ได้รับใบอนุญาตประกอบวิชาชีพ' },
            ].map((service, i) => {
              const ServiceIcon = service.icon
              return (
                <DrawBorderCard key={i} className="p-6 sm:p-8 md:p-10">
                  <span className="inline-block text-[10px] sm:text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-blue-50 text-[#0b4a74] mb-4">
                    งานหลัก
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#0b4a74] mb-4">
                    <ServiceIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold mb-2">{service.title}</h4>
                  <p className="leading-relaxed text-sm opacity-80">{service.desc}</p>
                  <div className="mt-4 sm:mt-6 text-xs sm:text-sm font-semibold text-[#1e90ff] flex items-center gap-1">
                    <span>รายละเอียดเพิ่มเติม</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </DrawBorderCard>
              )
            })}
          </div>

          {/* Bottom 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: 'รับเหมาก่อสร้างครบวงจร', icon: HardHat, desc: 'ดูแลตั้งแต่การเตรียมพื้นที่จนถึงส่งมอบงาน ด้วยทีมงานมืออาชีพและวัสดุคุณภาพ' },
              { title: 'งานปรับปรุงและรีโนเวท', icon: HomeIcon, desc: 'เปลี่ยนโฉมอาคารเก่าให้ดูทันสมัยและแข็งแรงทนทาน พร้อมการรับประกันงาน' },
              { title: 'ที่ปรึกษาด้านวิศวกรรม', icon: ClipboardCheck, desc: 'ให้คำปรึกษาเชิงเทคนิคและการตรวจสอบอาคารโดยผู้เชี่ยวชาญเฉพาะทาง' },
            ].map((service, i) => {
              const ServiceIcon = service.icon
              return (
                <DrawBorderCard key={i} className="p-6 sm:p-8">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#0b4a74] mb-4">
                    <ServiceIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold mb-2">{service.title}</h4>
                  <p className="leading-relaxed text-xs sm:text-sm opacity-80">{service.desc}</p>
                  <div className="mt-4 text-xs sm:text-sm font-semibold text-[#1e90ff] flex items-center gap-1">
                    <span>รายละเอียดเพิ่มเติม</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </DrawBorderCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. PORTFOLIO / PROJECTS */}
      <section id="projects" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-50 text-[#0b4a74] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                PORTFOLIO
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">โครงการที่โดดเด่น</h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base font-light">รวบรวมผลงานมาตรฐานงานก่อสร้างระดับพรีเมียม</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0b4a74] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">กำลังอัปเดตผลงานโครงการ</h3>
              <p className="text-xs text-slate-500 font-medium">ผลงานโครงการก่อสร้างใหม่กำลังถูกเพิ่มเข้ามา เร็วๆ นี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProjects.map((project) => {
                const rawImg = project.cover_image || (project as any).img || ''
                const coverImg = rawImg && !rawImg.startsWith('blob:') ? rawImg : '/Project/hor-puk-chang-ton/complete.jpg'
                return (
                  <Link
                    key={`${project.id}`}
                    href={`/project/${project.id}`}
                    className="group relative aspect-[4/3] sm:aspect-[3/4] bg-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl active:scale-[0.99] transition-all duration-300 block"
                  >
                    <Image
                      src={coverImg}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <span className="inline-block px-2.5 py-0.5 bg-[#1e90ff]/80 text-white rounded-md text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        {project.category}
                      </span>
                      <h4 className="text-white text-base sm:text-lg font-bold leading-snug line-clamp-2">{project.title}</h4>
                      <p className="text-slate-300 mt-1 text-xs flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1e90ff] shrink-0" />
                        <span>{project.location}</span>
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* 6. CONSTRUCTION QUEUE TRACKER */}
      <section id="queue" className="py-16 sm:py-24 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-block px-3.5 py-1 bg-[#1e90ff]/20 text-[#1e90ff] border border-[#1e90ff]/30 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
              LIVE SITE TRACKER
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">ตารางคิวและสถานะงานก่อสร้าง</h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base font-light">ติดตามความคืบหน้าการดำเนินงานก่อสร้างแต่ละไซต์งานแบบเรียลไทม์</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {queues.map((q) => {
              const statusInfo =
                q.status === 'in_progress'
                  ? { label: 'กำลังก่อสร้าง', icon: HardHat, bg: 'bg-blue-500/20 text-[#1e90ff] border-blue-500/30' }
                  : q.status === 'completed'
                  ? { label: 'เสร็จเรียบร้อย', icon: CheckCircle2, bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
                  : { label: 'รอคิวเริ่มงาน', icon: Clock, bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }

              const StatusIcon = statusInfo.icon

              return (
                <div key={q.id} className="bg-slate-800/90 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusInfo.label}</span>
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white mt-2.5 leading-snug">{q.project_name}</h3>
                      <p className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{q.location}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" />{q.client_name}</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">ความคืบหน้า</span>
                      <span className="text-[#1e90ff]">{q.progress_percent}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-[#0b4a74] to-[#1e90ff] rounded-full transition-all duration-700"
                        style={{ width: `${q.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  {(q.start_date || q.estimated_end_date) && (
                    <div className="flex justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-700/50">
                      <span>เริ่มงาน: {q.start_date || '-'}</span>
                      <span>คาดว่าเสร็จ: {q.estimated_end_date || '-'}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 7. CONTACT SECTION */}
      <section id="contact" className="py-16 sm:py-24 bg-[#0b4a74] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start relative z-10">
          {/* Contact Details */}
          <div className="space-y-6 sm:space-y-8">
            <span className="inline-block px-3.5 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              GET IN TOUCH
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              พร้อมเริ่มโปรเจกต์ <br className="hidden sm:inline" />กับเราแล้วหรือยัง?
            </h2>
            <p className="text-slate-200 text-base sm:text-lg font-light italic border-l-4 border-[#1e90ff] pl-4 sm:pl-6 py-1">
              "เชื่อมต่อทุกความฝันในการก่อสร้าง ด้วยคุณภาพงานวิศวกรรมระดับมาตรฐาน"
            </p>

            <div className="space-y-4 sm:space-y-6 pt-2">
              {/* Phone Item */}
              <a
                href="tel:0982192091"
                className="flex gap-4 items-center p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition active:scale-98 border border-white/10"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center text-xl sm:text-2xl shrink-0 text-[#1e90ff]">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">โทรสอบถามประเมินราคา</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">098-219-2091</p>
                </div>
              </a>

              {/* Email Item */}
              <a
                href="mailto:civilconnekt@gmail.com"
                className="flex gap-4 items-center p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition active:scale-98 border border-white/10"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center text-xl sm:text-2xl shrink-0 text-[#1e90ff]">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">อีเมลติดต่องาน</p>
                  <p className="text-lg sm:text-2xl font-bold text-white break-all">civilconnekt@gmail.com</p>
                </div>
              </a>

              {/* Location Item */}
              <a
                href="https://maps.google.com/?q=203+หมู่ที่+9+ตำบลป่าก่อดำ+อำเภอแม่ลาว+จ.เชียงราย+57250"
                target="_blank"
                rel="noreferrer"
                className="flex gap-4 items-center p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition active:scale-98 border border-white/10"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center text-xl sm:text-2xl shrink-0 text-[#1e90ff]">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <span>ที่อยู่สำนักงาน</span>
                    <ExternalLink className="w-3.5 h-3.5 inline" />
                  </p>
                  <p className="text-sm sm:text-base font-bold leading-snug mt-0.5 text-white">
                    203 หมู่ที่ 9 ตำบลป่าก่อดำ อำเภอแม่ลาว จ.เชียงราย 57250
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl text-slate-900 border border-slate-100">
            <h3 className="text-xl sm:text-2xl font-extrabold mb-6 text-center text-slate-900">ส่งข้อความหาเรา</h3>

            {contactSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center text-emerald-800 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg sm:text-xl font-extrabold text-emerald-900">ส่งข้อมูลสำเร็จเรียบร้อยแล้ว!</h4>
                <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed font-medium">
                  ขอบคุณที่สนใจบริการของ Civil Connek เจ้าหน้าที่ของเราจะติดต่อกลับทางเบอร์โทรศัพท์โดยเร็วที่สุด
                </p>
                <button
                  type="button"
                  onClick={() => setContactSuccess(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition mt-2"
                >
                  ส่งข้อความเพิ่ม
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      ชื่อผู้ติดต่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="กรอกชื่อของคุณ..."
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      className="w-full h-12 sm:h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-base"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0xx-xxx-xxxx"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      className="w-full h-12 sm:h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-base"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">รายละเอียดโปรเจกต์</label>
                  <textarea
                    rows={3}
                    placeholder="คุณกำลังสนใจก่อสร้างประเภทไหน หรือต้องการสอบถามเรื่องใด..."
                    value={contactDetail}
                    onChange={e => setContactDetail(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full py-4 sm:py-4.5 bg-[#1e90ff] text-white font-black rounded-xl hover:bg-slate-900 transition-all shadow-lg hover:shadow-[#1e90ff]/30 disabled:opacity-50 flex items-center justify-center gap-2 text-base active:scale-98"
                >
                  {contactSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>กำลังส่งข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ส่งข้อมูลให้เจ้าหน้าที่ติดต่อกลับ</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-10 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-3 opacity-75">
            <div className="relative w-8 h-8 shrink-0">
              <Image src="/logo.png" alt="โลโก้ CIVIL CONNEK" fill sizes="32px" className="object-contain" />
            </div>
            <p className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">CIVIL CONNEK CO., LTD.</p>
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider">
            COPYRIGHT © 2026 บริษัท ซีวิล คอนเนค จำกัด - ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      {/* 9. FLOATING MOBILE QUICK ACTION BAR */}
      <FloatingMobileBar />
    </div>
  )
}