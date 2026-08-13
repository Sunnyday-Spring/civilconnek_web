import Image from 'next/image'
import Link from 'next/link'
import { fetchProjectById } from '@/lib/supabase/projects'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await fetchProjectById(id)

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-2xl font-bold text-slate-700">ไม่พบโครงการนี้</p>
        <Link href="/" className="text-[#1e90ff] font-bold hover:underline">← กลับหน้าหลัก</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image src="/logo.png" alt="โลโก้" fill sizes="48px" className="object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-lg leading-none tracking-tight">CIVIL CONNEK</h1>
              <p className="text-[10px] text-slate-500 tracking-[0.2em] font-bold uppercase">บริษัท ซีวิล คอนเนค จำกัด</p>
            </div>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
            <Link href="/" className="hover:text-[#0b4a74] transition">หน้าแรก</Link>
            <Link href="/services" className="hover:text-[#0b4a74] transition">บริการของเรา</Link>
            <Link href="/#projects" className="text-[#0b4a74]">ผลงาน</Link>
            <Link href="/#contact" className="hover:text-[#0b4a74] transition">ติดต่อสอบถาม</Link>
          </div>
          <Link href="/#contact" className="bg-[#0b4a74] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition shadow-md">
            ติดต่อเรา
          </Link>
        </div>
      </nav>

      <div className="relative h-[60vh] bg-slate-900 overflow-hidden">
        <Image
          src={
            project.cover_image && !project.cover_image.startsWith('blob:')
              ? project.cover_image
              : project.photos && project.photos.length > 0 && !project.photos[0].img.startsWith('blob:')
              ? project.photos[0].img
              : '/Project/hor-puk-chang-ton/complete.jpg'
          }
          alt={project.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="absolute bottom-0 left-0 right-0 p-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-white transition">หน้าแรก</Link>
            <span>/</span>
            <Link href="/#projects" className="hover:text-white transition">ผลงาน</Link>
            <span>/</span>
            <span className="text-white">{project.title}</span>
          </div>
          <div className="inline-block px-3 py-1 bg-[#1e90ff]/20 text-[#1e90ff] rounded-full text-xs font-bold tracking-widest uppercase mb-3">
            {project.category}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">{project.title}</h1>
          <p className="text-slate-300 mt-2 text-sm">📍 {project.location} · {project.year}</p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">รายละเอียดโครงการ</h2>
            <p className="text-slate-500 leading-relaxed">{project.description || project.desc}</p>
          </div>
          <div className="space-y-4">
            {[
              { label: 'ประเภทงาน', value: project.type },
              { label: 'สถานที่', value: project.location },
              { label: 'ปีที่ดำเนินการ', value: project.year },
              { label: 'หมวดหมู่', value: project.category },
            ].map((item, i) => (
              <div key={i} className="border-b border-slate-100 pb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="font-bold text-slate-800">{item.value}</p>
              </div>
            ))}
            <Link href="/#contact" className="block w-full text-center bg-[#0b4a74] text-white py-3 rounded-xl font-bold hover:bg-[#1e90ff] transition mt-4">
              สอบถามโครงการนี้
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">รูปภาพโครงการทั้งหมด</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(project.photos && project.photos.length > 0 ? project.photos : [{ id: '1', img: project.cover_image, label: 'รูปผลงานหลัก' }]).map((photo, i) => {
            const imgSrc = photo.img && !photo.img.startsWith('blob:') ? photo.img : '/Project/hor-puk-chang-ton/complete.jpg'
            return (
              <div key={photo.id || i} className="group relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden">
                <Image src={imgSrc} alt={photo.label} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4">
                  <p className="text-white text-sm font-bold">{photo.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="py-16 bg-[#0b4a74]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">สนใจให้เราดูแลโปรเจกต์ของคุณ?</h2>
          <p className="text-slate-300 mb-8">ทีมงานพร้อมให้คำปรึกษาโดยไม่มีค่าใช้จ่าย</p>
          <Link href="/#contact" className="inline-block bg-[#1e90ff] text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            ติดต่อเราเลย
          </Link>
        </div>
      </section>

      <footer className="py-10 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 opacity-60">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="โลโก้" fill sizes="32px" className="object-contain" />
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