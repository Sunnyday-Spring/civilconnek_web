'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Project, ProjectPhoto } from '@/lib/supabase/types'
import {
  ArrowLeft,
  Building2,
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from 'lucide-react'

interface GalleryPhotoItem {
  id: string
  file: File | null
  url: string
  label: string
  existingId?: string
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('งานสถาปัตยกรรม')
  const [customCategory, setCustomCategory] = useState('')
  const [location, setLocation] = useState('')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [type, setType] = useState('รับเหมาก่อสร้างครบวงจร')
  const [desc, setDesc] = useState('')

  // Cover Image State
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverUrlInput, setCoverUrlInput] = useState('')
  const [coverPreview, setCoverPreview] = useState('')

  // Gallery Photos State
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>([])

  // Load Existing Project
  useEffect(() => {
    async function loadProjectData() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('projects')
          .select('*, photos:project_photos(*)')
          .eq('id', id)
          .single()

        if (error || !data) {
          alert('ไม่พบข้อมูลโครงการนี้')
          router.push('/admin/projects')
          return
        }

        const proj = data as (Project & { photos?: ProjectPhoto[] })
        setTitle(proj.title || '')
        setLocation(proj.location || '')
        setYear(proj.year || new Date().getFullYear().toString())
        setType(proj.type || 'รับเหมาก่อสร้างครบวงจร')
        setDesc(proj.description || proj.desc || '')

        const cat = proj.category || 'งานสถาปัตยกรรม'
        const standardCats = ['งานสถาปัตยกรรม', 'งานโครงสร้าง', 'งานอาคารพักอาศัย', 'งานปรับปรุงรีโนเวท']
        if (standardCats.includes(cat)) {
          setCategory(cat)
        } else {
          setCategory('อื่นๆ')
          setCustomCategory(cat)
        }

        setCoverPreview(proj.cover_image || '')
        setCoverUrlInput(proj.cover_image || '')

        if (proj.photos && proj.photos.length > 0) {
          const sortedPhotos = [...proj.photos].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          setGalleryPhotos(
            sortedPhotos.map(p => ({
              id: p.id,
              existingId: p.id,
              file: null,
              url: p.img,
              label: p.label || 'ขั้นตอนการทำงาน',
            }))
          )
        }
      } catch (err: any) {
        console.error('Load project for edit error:', err)
        alert(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [id, router])

  // Handle Cover File
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  // Add Gallery Photo
  const addGalleryPhoto = () => {
    setGalleryPhotos(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        file: null,
        url: '',
        label: 'ขั้นตอนการทำงาน',
      },
    ])
  }

  // Update Gallery Photo
  const updateGalleryPhoto = (photoId: string, field: keyof GalleryPhotoItem, value: any) => {
    setGalleryPhotos(prev =>
      prev.map(item => {
        if (item.id !== photoId) return item
        if (field === 'file') {
          const file = value as File
          return {
            ...item,
            file,
            url: file ? URL.createObjectURL(file) : item.url,
          }
        }
        return { ...item, [field]: value }
      })
    )
  }

  // Remove Gallery Photo
  const removeGalleryPhoto = (photoId: string) => {
    setGalleryPhotos(prev => prev.filter(item => item.id !== photoId))
  }

  // File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Upload helper
  const uploadFileToSupabase = async (supabase: any, file: File, folder: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(fileName, file, { upsert: true })

      if (error) {
        return await fileToBase64(file)
      }

      const { data: publicData } = supabase.storage
        .from('project-images')
        .getPublicUrl(data.path)

      return publicData.publicUrl
    } catch {
      return await fileToBase64(file)
    }
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !location.trim()) {
      alert('กรุณากรอกชื่อโครงการและสถานที่ให้ครบถ้วน')
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const finalCategory = category === 'อื่นๆ' ? customCategory : category

      // 1. Cover URL
      let finalCoverUrl = coverUrlInput.trim()
      if (coverFile) {
        finalCoverUrl = await uploadFileToSupabase(supabase, coverFile, 'covers')
      }
      if (!finalCoverUrl || finalCoverUrl.startsWith('blob:')) {
        finalCoverUrl = coverPreview || '/Project/hor-puk-chang-ton/complete.jpg'
      }

      // 2. Update `projects` table
      const { error: updateError } = await (supabase
        .from('projects') as any)
        .update({
          title: title.trim(),
          category: finalCategory.trim(),
          location: location.trim(),
          description: desc.trim(),
          year: year.trim(),
          type: type.trim(),
          cover_image: finalCoverUrl,
        })
        .eq('id', id)

      if (updateError) {
        throw new Error(`อัปเดตโครงการไม่สำเร็จ: ${updateError.message}`)
      }

      // 3. Clear and Re-insert Gallery Photos
      await (supabase.from('project_photos') as any).delete().eq('project_id', id)

      if (galleryPhotos.length > 0) {
        const photoInserts = []
        for (let i = 0; i < galleryPhotos.length; i++) {
          const item = galleryPhotos[i]
          let photoUrl = item.url.trim()

          if (item.file) {
            try {
              photoUrl = await uploadFileToSupabase(supabase, item.file, 'gallery')
            } catch {
              photoUrl = item.url || '/Project/hor-puk-chang-ton/complete.jpg'
            }
          }

          if (photoUrl && !photoUrl.startsWith('blob:')) {
            photoInserts.push({
              project_id: id,
              img: photoUrl,
              label: item.label || `ขั้นตอนที่ ${i + 1}`,
              display_order: i + 1,
            })
          }
        }

        if (photoInserts.length > 0) {
          await (supabase.from('project_photos') as any).insert(photoInserts)
        }
      }

      alert('🎉 บันทึกการแก้ไขผลงานเรียบร้อยแล้ว!')
      router.push('/admin/projects')
      router.refresh()
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <Loader2 className="w-10 h-10 text-[#1e90ff] animate-spin mb-3" />
        <p className="text-slate-600 font-bold text-sm">กำลังโหลดข้อมูลโครงการเพื่อแก้ไข...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Header */}
      <nav className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link
            href="/admin/projects"
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าจัดการผลงาน</span>
          </Link>
          <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1e90ff]" />
            <span>แก้ไขผลงาน (Edit Project)</span>
          </h1>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Section 1: ข้อมูลทั่วไป */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1e90ff]" />
              <span>ข้อมูลทั่วไปของโครงการ</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* ชื่อโครงการ */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  ชื่อโครงการ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หอพักช่างต้น, โกดังคลังสินค้า A"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-base"
                />
              </div>

              {/* หมวดหมู่ */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">หมวดหมู่โครงการ</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-base"
                >
                  <option value="งานสถาปัตยกรรม">งานสถาปัตยกรรม</option>
                  <option value="งานโครงสร้าง">งานโครงสร้าง</option>
                  <option value="งานอาคารพักอาศัย">งานอาคารพักอาศัย</option>
                  <option value="งานปรับปรุงรีโนเวท">งานปรับปรุงรีโนเวท</option>
                  <option value="อื่นๆ">อื่นๆ (ระบุเอง)</option>
                </select>
              </div>

              {category === 'อื่นๆ' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">ระบุหมวดหมู่ใหม่</label>
                  <input
                    type="text"
                    placeholder="เช่น โกดังโรงงาน, รีสอร์ท"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-base"
                  />
                </div>
              )}

              {/* สถานที่ */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  สถานที่ก่อสร้าง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อ.เมือง จ.เชียงราย"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-base"
                />
              </div>

              {/* ปีที่ดำเนินการ */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">ปีที่ดำเนินการ</label>
                <input
                  type="text"
                  placeholder="2026"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-base"
                />
              </div>

              {/* ประเภทงาน */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">ประเภทงาน</label>
                <input
                  type="text"
                  placeholder="เช่น ออกแบบและรับเหมาก่อสร้างครบวงจร"
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-base"
                />
              </div>

              {/* รายละเอียด */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">รายละเอียดโครงการ</label>
                <textarea
                  rows={4}
                  placeholder="รายละเอียดเพิ่มเติมของโครงการ..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-base"
                />
              </div>
            </div>
          </div>

          {/* Section 2: รูปภาพปก */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#1e90ff]" />
              <span>รูปภาพปกโครงการ (Cover Image)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                    เลือกรูปภาพใหม่จากอุปกรณ์
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full h-12 bg-blue-50 hover:bg-blue-100 text-[#0b4a74] rounded-xl border border-blue-200 cursor-pointer font-bold text-xs transition">
                    <Upload className="w-4 h-4" />
                    <span>เลือกไฟล์รูปภาพ...</span>
                    <input type="file" accept="image/*" onChange={handleCoverFileChange} className="hidden" />
                  </label>
                </div>
                <div className="text-center text-xs text-slate-400 font-bold uppercase">— หรือระบุ URL รูปภาพ —</div>
                <div>
                  <input
                    type="text"
                    placeholder="https://example.com/cover.jpg"
                    value={coverUrlInput}
                    onChange={e => {
                      setCoverUrlInput(e.target.value)
                      setCoverPreview(e.target.value)
                    }}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                {coverPreview ? (
                  <Image src={coverPreview} alt="รูปปก" fill className="object-cover" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs font-bold">ยังไม่มีรูปปก</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: รูปอัลบั้มขั้นตอน */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#1e90ff]" />
                <span>รูปภาพอัลบั้มขั้นตอนผลงาน ({galleryPhotos.length} รูป)</span>
              </h2>
              <button
                type="button"
                onClick={addGalleryPhoto}
                className="bg-blue-50 text-[#0b4a74] border border-blue-200 font-bold text-xs px-4 py-2 rounded-xl hover:bg-blue-100 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มรูปผลงาน</span>
              </button>
            </div>

            {galleryPhotos.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-bold">ยังไม่มีรูปอัลบั้ม สามารถกดปุ่ม + เพิ่มรูปผลงาน ได้ทันที</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {galleryPhotos.map((item, index) => (
                  <div key={item.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-500">รูปขั้นตอนที่ {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeGalleryPhoto(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </div>

                    <div className="relative aspect-[4/3] bg-slate-200 rounded-xl overflow-hidden border border-slate-300">
                      {item.url ? (
                        <Image src={item.url} alt={`รูปขั้นตอน ${index + 1}`} fill className="object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                          ยังไม่ได้เลือกรูป
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center justify-center gap-2 w-full h-10 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 cursor-pointer font-bold text-xs transition">
                        <Upload className="w-3.5 h-3.5 text-[#1e90ff]" />
                        <span>เลือกรูปภาพจากเครื่อง...</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => updateGalleryPhoto(item.id, 'file', e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="text"
                        placeholder="ชื่อขั้นตอน เช่น งานตอกเสาเข็ม"
                        value={item.label}
                        onChange={e => updateGalleryPhoto(item.id, 'label', e.target.value)}
                        className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 bg-[#1e90ff] text-white font-extrabold rounded-2xl hover:bg-slate-900 transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 text-base active:scale-98"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>กำลังบันทึกการแก้ไข...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>บันทึกการแก้ไขผลงาน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
