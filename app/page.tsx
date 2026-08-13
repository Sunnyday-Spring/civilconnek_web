'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

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

    // ใช้ JS event listener แทน Tailwind group-hover (ไม่ทำงานกับ SVG attribute)
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
      className={`relative bg-white border border-slate-200/60 rounded-2xl group hover:-translate-y-1 hover:shadow-xl block ${className}`}
      style={{ transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease' }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
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

// ----------------------------------------------------------------------
// สร้างข้อมูลผลงานไว้ตรงนี้ เพื่อให้ง่ายต่อการแก้ไขและเพิ่มโครงการใหม่ในอนาคต
// ----------------------------------------------------------------------
const projectsData = [
  {
    id: 1,
    img: '/Project/hor-puk-chang-ton/complete.jpg',
    title: 'หอ',
    category: 'ที่พักอาศัย',
    location: 'เชียงราย',
  },
]





export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* 1. แถบเมนู (NAVIGATION BAR) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image src="/logo.png" alt="โลโก้ บริษัท ซีวิล คอนเนค จำกัด" fill sizes="48px" className="object-contain" />
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="font-extrabold text-lg leading-none tracking-tight">CIVIL CONNEK</h1>
              <p className="text-[10px] text-slate-500 tracking-[0.2em] font-bold uppercase">บริษัท ซีวิล คอนเนค จำกัด</p>
            </div>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
            <Link href="/" className="hover:text-[#0b4a74] transition">หน้าแรก</Link>
            <Link href="/services" className="hover:text-[#0b4a74] transition">บริการของเรา</Link>
            <Link href="#projects" className="hover:text-[#0b4a74] transition">ผลงาน</Link>
            <Link href="#about" className="hover:text-[#0b4a74] transition">เกี่ยวกับเรา</Link>
            <Link href="#contact" className="hover:text-[#0b4a74] transition">ติดต่อสอบถาม</Link>
          </div>
        </div>
      </nav>

      {/* 2. ส่วนหัวเว็บ (HERO SECTION) */}
      <section className="relative h-[85vh] bg-slate-900 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/hero-bg.jpg" alt="หน้าไซต์งานก่อสร้าง" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-slate-950/50"></div>
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl space-y-6">
            <div className="inline-block px-4 py-1 bg-[#1e90ff]/20 text-[#1e90ff] rounded-full text-xs font-bold tracking-widest uppercase">
              ผู้เชี่ยวชาญด้านงานก่อสร้างและวิศวกรรม
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1]">
              สร้างสรรค์ <span className="text-[#1e90ff]">โครงสร้าง</span> <br />สู่อนาคตที่ยั่งยืน
            </h2>
            <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl leading-relaxed">
              บริการออกแบบและรับเหมาก่อสร้างครบวงจร โดยทีมวิศวกรและสถาปนิกมืออาชีพ
              มุ่งเน้นคุณภาพ มาตรฐานวิศวกรรม และความพึงพอใจของลูกค้าเป็นสำคัญ
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/services" className="bg-[#1e90ff] text-white px-10 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-[#1e90ff]/40 transition-all hover:-translate-y-1">ชมผลงานของเรา</Link>
              <Link href="#contact" className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-lg font-bold text-lg hover:bg-white/20 transition">รู้จักเรามากขึ้น</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ตัวเลขสถิติ (STATISTICS) */}
      <div className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'โครงการที่สำเร็จ', value: '30+' },
            { label: 'ประสบการณ์ (ปี)', value: '12+' },
            { label: 'ทีมวิศวกรเชี่ยวชาญ', value: '45+' },
            { label: 'ความพึงพอใจลูกค้า', value: '100%' },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl font-black text-[#0b4a74] mb-1 group-hover:scale-110 transition-transform">{stat.value}</div>
              <div className="text-sm text-slate-500 font-bold uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. บริการของเรา (SERVICES) */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-[#1e90ff] font-bold tracking-[0.3em] text-sm uppercase mb-4">OUR SERVICES</h3>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">บริการที่เชี่ยวชาญ</h2>
            <div className="w-12 h-1 bg-[#0b4a74] mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Featured 2 cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {[
              { title: 'งานออกแบบสถาปัตยกรรม', icon: '🏛️', desc: 'ออกแบบบ้าน อาคารสำนักงาน และโครงการอสังหาริมทรัพย์ที่ตอบโจทย์การใช้งาน ด้วยทีมสถาปนิกมืออาชีพและซอฟต์แวร์ออกแบบระดับสากล' },
              { title: 'งานวิศวกรรมโครงสร้าง', icon: '🏗️', desc: 'ควบคุมการก่อสร้างและคำนวณโครงสร้างตามมาตรฐานวิศวกรรมที่ปลอดภัย โดยทีมวิศวกรที่ได้รับใบอนุญาตประกอบวิชาชีพ' },
            ].map((service, i) => (
              <DrawBorderCard key={i} className="p-10">
                <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded bg-blue-50 text-[#0b4a74] mb-5">
                  งานหลัก
                </span>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl mb-5">
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{service.title}</h4>
                <p className="leading-relaxed text-sm opacity-70">{service.desc}</p>
                <p className="mt-5 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">ดูรายละเอียด →</p>
              </DrawBorderCard>
            ))}
          </div>

          {/* Bottom 3 cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'รับเหมาก่อสร้างครบวงจร', icon: '👷', desc: 'ดูแลตั้งแต่การเตรียมพื้นที่จนถึงส่งมอบงาน ด้วยทีมงานมืออาชีพและวัสดุคุณภาพ' },
              { title: 'งานปรับปรุงและรีโนเวท', icon: '🏠', desc: 'เปลี่ยนโฉมอาคารเก่าให้ดูทันสมัยและแข็งแรงทนทาน พร้อมการรับประกันงาน' },
              { title: 'ที่ปรึกษาด้านวิศวกรรม', icon: '🧠', desc: 'ให้คำปรึกษาเชิงเทคนิคและการตรวจสอบอาคารโดยผู้เชี่ยวชาญเฉพาะทาง' },
            ].map((service, i) => (
              <DrawBorderCard key={i} className="p-8">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl mb-5">
                  {service.icon}
                </div>
                <h4 className="text-lg font-bold mb-3">{service.title}</h4>
                <p className="leading-relaxed text-sm opacity-70">{service.desc}</p>
                <p className="mt-5 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">ดูรายละเอียด →</p>
              </DrawBorderCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ส่วนผลงาน (PORTFOLIO) */}
      <section id="projects" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">โครงการที่โดดเด่น</h2>
              <p className="text-slate-500 mt-3 text-lg font-light">รวบรวมความภาคภูมิใจและมาตรฐานงานก่อสร้างระดับพรีเมียม</p>
            </div>
            <Link href="/projects" className="text-[#0b4a74] font-bold border-b-2 border-[#0b4a74] pb-1 hover:text-[#1e90ff] hover:border-[#1e90ff] transition">ดูผลงานทั้งหมด</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projectsData.map((project) => (
              <Link key={`${project.id}-${project.img}`} href={`/project/${project.id}`} className="group relative aspect-[3/4] bg-slate-200 rounded-3xl overflow-hidden shadow-lg block">
                {/* รูปภาพ */}
                <Image
                  src={project.img}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* gradient ด้านล่าง — แสดงตลอดเวลา */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent" />
                {/* ข้อความ — แสดงตลอดเวลา ไม่ต้อง hover */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[#1e90ff] text-xs font-bold uppercase tracking-widest mb-2">{project.category}</p>
                  <h4 className="text-white text-lg font-bold leading-tight">{project.title}</h4>
                  <p className="text-slate-400 mt-2 text-xs">📍 {project.location}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 6. ส่วนติดต่อเรา (CONTACT) */}
      <section id="contact" className="py-24 bg-[#0b4a74] text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 relative z-10">
          <div className="space-y-8">
            <h2 className="text-5xl font-extrabold leading-tight">พร้อมเริ่มโปรเจกต์ <br />กับเราแล้วหรือยัง?</h2>
            <p className="text-slate-300 text-xl font-light italic border-l-4 border-[#1e90ff] pl-6">
              "เชื่อมต่อทุกความฝันในการก่อสร้าง ด้วยคุณภาพงานวิศวกรรมระดับมาตรฐาน"
            </p>
            <div className="space-y-6 pt-6">
              <div className="flex gap-5 items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">📞</div>
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">โทรสอบถาม</p>
                  <p className="text-2xl font-bold">098-219-2091</p>
                </div>
              </div>
              <div className="flex gap-5 items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">✉️</div>
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">อีเมล</p>
                  <p className="text-2xl font-bold">civilconnekt@gamil.com</p>
                </div>
              </div>
              <div className="flex gap-5 items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">📍</div>
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">ที่อยู่บริษัท</p>
                  <p className="text-lg font-bold">เลขที่ xxx ถนน... เขต... กรุงเทพฯ</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-slate-900">
            <h3 className="text-2xl font-bold mb-8 text-center">ส่งข้อความหาเรา</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ชื่อผู้ติดต่อ</label>
                  <div className="h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center text-slate-400">กรอกชื่อของคุณ...</div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">เบอร์โทรศัพท์</label>
                  <div className="h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center text-slate-400">0xx-xxx-xxxx</div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">รายละเอียดโปรเจกต์</label>
                <div className="h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-400">คุณกำลังสนใจก่อสร้างประเภทไหน...</div>
              </div>
              <button className="w-full py-5 bg-[#1e90ff] text-white font-black rounded-xl hover:bg-slate-900 transition-all shadow-lg hover:shadow-[#1e90ff]/30">
                ส่งข้อมูลให้เจ้าหน้าที่ติดต่อกลับ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ส่วนท้าย (FOOTER) */}
      <footer className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-60">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="โลโก้ CIVIL CONNEK" fill sizes="32px" className="object-contain" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">CIVIL CONNEK CO., LTD.</p>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest">
            COPYRIGHT © 2026 บริษัท ซีวิล คอนเนค จำกัด - ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

    </div>
  )
}