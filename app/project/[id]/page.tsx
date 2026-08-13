import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import FloatingMobileBar from '@/components/FloatingMobileBar'
import { fetchProjectById } from '@/lib/supabase/projects'
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await fetchProjectById(id)

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4 font-sans text-center">
        <Building2 className="w-16 h-16 text-slate-400" />
        <p className="text-xl sm:text-2xl font-bold text-slate-700">ไม่พบโครงการนี้</p>
        <Link href="/" className="bg-[#0b4a74] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1e90ff] transition flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </Link>
      </div>
    )
  }

  const coverImg =
    project.cover_image && !project.cover_image.startsWith('blob:')
      ? project.cover_image
      : project.photos && project.photos.length > 0 && !project.photos[0].img.startsWith('blob:')
      ? project.photos[0].img
      : '/Project/hor-puk-chang-ton/complete.jpg'

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-16 md:pb-0">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative min-h-[45vh] md:h-[60vh] bg-slate-900 overflow-hidden flex items-end">
        <Image
          src={coverImg}
          alt={project.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20" />
        <div className="relative z-10 p-5 sm:p-8 md:p-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-white transition">หน้าแรก</Link>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <Link href="/#projects" className="hover:text-white transition">ผลงาน</Link>
            <ChevronRight className="w-3 h-3 text-white/50" />
            <span className="text-white line-clamp-1">{project.title}</span>
          </div>
          <span className="inline-block px-3 py-1 bg-[#1e90ff]/30 border border-[#1e90ff]/40 text-[#1e90ff] rounded-full text-xs font-bold tracking-wider uppercase mb-2">
            {project.category}
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">{project.title}</h1>
          <p className="text-slate-300 mt-2 text-xs sm:text-sm font-medium flex items-center gap-2">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#1e90ff]" />{project.location}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#1e90ff]" />ปี {project.year}</span>
          </p>
        </div>
      </div>

      {/* Main Details Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 sm:mb-16">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 border-l-4 border-[#0b4a74] pl-3">
              รายละเอียดโครงการ
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal whitespace-pre-line">
              {project.description || project.desc || 'ไม่มีรายละเอียดเพิ่มเติม'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">ข้อมูลสรุป</h3>
            {[
              { label: 'ประเภทงาน', value: project.type, icon: Layers },
              { label: 'สถานที่', value: project.location, icon: MapPin },
              { label: 'ปีที่ดำเนินการ', value: project.year, icon: Calendar },
              { label: 'หมวดหมู่', value: project.category, icon: Building2 },
            ].map((item, i) => {
              const ItemIcon = item.icon
              return (
                <div key={i} className="border-b border-slate-200/50 pb-2.5 last:border-0">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <ItemIcon className="w-3 h-3 text-slate-400" />
                    <span>{item.label}</span>
                  </p>
                  <p className="font-bold text-slate-800 text-sm">{item.value || '-'}</p>
                </div>
              )
            })}
            <Link
              href="/#contact"
              className="block w-full text-center bg-[#0b4a74] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1e90ff] transition active:scale-98 shadow-md mt-4"
            >
              สอบถามงานก่อสร้างแบบนี้
            </Link>
          </div>
        </div>

        {/* Gallery */}
        <h2 className="text-xl sm:text-2xl font-extrabold mb-6 border-l-4 border-[#0b4a74] pl-3">
          รูปภาพโครงการทั้งหมด
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {(project.photos && project.photos.length > 0 ? project.photos : [{ id: '1', img: coverImg, label: 'รูปผลงานหลัก' }]).map((photo, i) => {
            const imgSrc = photo.img && !photo.img.startsWith('blob:') ? photo.img : coverImg
            return (
              <div key={photo.id || i} className="group relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <Image
                  src={imgSrc}
                  alt={photo.label}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4">
                  <p className="text-white text-xs sm:text-sm font-bold">{photo.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-[#0b4a74]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">สนใจให้เราดูแลโปรเจกต์ของคุณ?</h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">ทีมงานวิศวกรและสถาปนิกพร้อมให้คำปรึกษาประเมินราคาโดยไม่มีค่าใช้จ่าย</p>
          <div className="pt-2">
            <Link
              href="/#contact"
              className="inline-block bg-[#1e90ff] text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-slate-900 shadow-lg transition-all active:scale-98"
            >
              ติดต่อเราเลย
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-3 opacity-75">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="โลโก้" fill sizes="32px" className="object-contain" />
            </div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">CIVIL CONNEK CO., LTD.</p>
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-widest">
            COPYRIGHT © 2026 บริษัท ซีวิล คอนเนค จำกัด - ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      <FloatingMobileBar />
    </div>
  )
}