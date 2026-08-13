'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface GalleryPhotoItem {
  id: string
  file: File | null
  url: string
  label: string
}

export default function AddProjectPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('ที่พักอาศัย')
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

  // Handle Cover Image Selection
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  // Add Gallery Photo Item
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

  // Update Gallery Photo Item
  const updateGalleryPhoto = (id: string, field: keyof GalleryPhotoItem, value: any) => {
    setGalleryPhotos(prev =>
      prev.map(item => {
        if (item.id !== id) return item
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

  // Remove Gallery Photo Item
  const removeGalleryPhoto = (id: string) => {
    setGalleryPhotos(prev => prev.filter(item => item.id !== id))
  }

  // Helper to convert file to persistent Base64 Data URL if Supabase storage is unavailable
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Upload file helper function
  const uploadFileToSupabase = async (supabase: any, file: File, folder: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(fileName, file, { upsert: true })

      if (error) {
        console.warn(`Storage upload failed (${file.name}), converting to persistent Base64:`, error.message)
        return await fileToBase64(file)
      }

      const { data: publicData } = supabase.storage
        .from('project-images')
        .getPublicUrl(data.path)

      return publicData.publicUrl
    } catch (err: any) {
      console.warn('Fallback to Base64:', err)
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

      // 1. Upload Cover Image
      let finalCoverUrl = coverUrlInput.trim()
      if (coverFile) {
        finalCoverUrl = await uploadFileToSupabase(supabase, coverFile, 'covers')
      }

      if (!finalCoverUrl || finalCoverUrl.startsWith('blob:')) {
        finalCoverUrl = coverFile ? await fileToBase64(coverFile) : '/Project/hor-puk-chang-ton/complete.jpg'
      }

      if (!finalCoverUrl) {
        finalCoverUrl = '/Project/hor-puk-chang-ton/complete.jpg'
      }

      // 2. Insert into `projects` table
      const { data: newProject, error: projectError } = await (supabase
        .from('projects') as any)
        .insert({
          title: title.trim(),
          category: finalCategory.trim(),
          location: location.trim(),
          description: desc.trim(),
          year: year.trim(),
          type: type.trim(),
          cover_image: finalCoverUrl,
        })
        .select()
        .single()

      if (projectError) {
        throw new Error(`สร้างโครงการไม่สำเร็จ: ${projectError.message}`)
      }

      // 3. Upload and Insert Gallery Photos
      if (galleryPhotos.length > 0 && newProject) {
        const photoInserts = []

        for (let i = 0; i < galleryPhotos.length; i++) {
          const item = galleryPhotos[i]
          let photoUrl = item.url.trim()

          if (item.file) {
            try {
              photoUrl = await uploadFileToSupabase(supabase, item.file, 'gallery')
            } catch (err: any) {
              console.warn('Gallery photo upload warning:', err.message)
              photoUrl = item.url || '/Project/hor-puk-chang-ton/complete.jpg'
            }
          }

          if (photoUrl) {
            photoInserts.push({
              project_id: newProject.id,
              img: photoUrl,
              label: item.label || `ขั้นตอนที่ ${i + 1}`,
              display_order: i + 1,
            })
          }
        }

        if (photoInserts.length > 0) {
          const { error: photoErr } = await (supabase
            .from('project_photos') as any)
            .insert(photoInserts)

          if (photoErr) {
            console.error('Photo insert error:', photoErr.message)
          }
        }
      }

      alert('🎉 บันทึกข้อมูลผลงานเรียบร้อยแล้ว!')
      router.push('/admin/projects')
      router.refresh()
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`)
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/admin/projects" className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition">
            ← กลับหน้าจัดการผลงาน
          </Link>
          <h1 className="font-extrabold text-sm tracking-tight text-white">เพิ่มผลงานใหม่ (Add Project)</h1>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: ข้อมูลทั่วไป */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
              <span>📋</span> ข้อมูลทั่วไปของโครงการ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ชื่อโครงการ */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  ชื่อโครงการ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หอพักช่างต้น, โกดังคลังสินค้า A"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition"
                />
              </div>

              {/* หมวดหมู่ */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  หมวดหมู่โครงการ <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition"
                >
                  <option value="ที่พักอาศัย">ที่พักอาศัย (Residential)</option>
                  <option value="อาคารพาณิชย์">อาคารพาณิชย์ (Commercial)</option>
                  <option value="โรงงาน/โกดัง">โรงงาน / โกดัง (Industrial)</option>
                  <option value="งานวิศวกรรมโครงสร้าง">งานวิศวกรรมโครงสร้าง</option>
                  <option value="งานปรับปรุง/รีโนเวท">งานปรับปรุง / รีโนเวท</option>
                  <option value="อื่นๆ">อื่นๆ...</option>
                </select>
                {category === 'อื่นๆ' && (
                  <input
                    type="text"
                    placeholder="ระบุหมวดหมู่..."
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm mt-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff]"
                  />
                )}
              </div>

              {/* สถานที่ */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  สถานที่ตั้ง / จังหวัด <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เชียงราย, กรุงเทพฯ"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition"
                />
              </div>

              {/* ปีที่ดำเนินการ */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  ปีที่ดำเนินการ (ค.ศ. หรือ พ.ศ.)
                </label>
                <input
                  type="text"
                  placeholder="เช่น 2024"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition"
                />
              </div>

              {/* ประเภทงาน */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  ประเภทขอบเขตงาน
                </label>
                <input
                  type="text"
                  placeholder="เช่น รับเหมาก่อสร้างครบวงจร, ออกแบบสถาปัตยกรรม"
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition"
                />
              </div>

              {/* รายละเอียด */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  รายละเอียดโครงการ (Description)
                </label>
                <textarea
                  rows={4}
                  placeholder="อธิบายรายละเอียด เช่น การรับเหมาก่อสร้างอาคารพักอาศัย การเตรียมฐานราก การดำเนินงาน..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff] transition text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: รูปภาพปก */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
              <span>🖼️</span> รูปภาพปกโครงการ (Cover Image)
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold px-5 py-3 rounded-xl transition flex items-center gap-2">
                  <span>📁 เลือกไฟล์รูปภาพจากเครื่อง</span>
                  <input type="file" accept="image/*" onChange={handleCoverFileChange} className="hidden" />
                </label>
                <span className="text-xs text-slate-400 font-semibold">หรือกรอก URL รูปภาพโดยตรง</span>
              </div>

              <input
                type="text"
                placeholder="https://... หรือ /Project/my-image.jpg"
                value={coverUrlInput}
                onChange={e => {
                  setCoverUrlInput(e.target.value)
                  if (e.target.value) setCoverPreview(e.target.value)
                }}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e90ff]"
              />

              {/* Preview */}
              {coverPreview && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-slate-500 mb-2">ตัวอย่างรูปภาพปก:</p>
                  <div className="relative w-full max-w-md h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
                    <Image src={coverPreview} alt="Cover Preview" fill className="object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: อัลบั้มรูปภาพขั้นตอนงาน */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>📸</span> อัลบั้มภาพขั้นตอนการทำงาน (Gallery Photos)
                </h2>
                <p className="text-xs text-slate-500 mt-1">เพิ่มรูปภาพแต่ละขั้นตอน เช่น แบบ 3D, งานฐานราก, งานโครงสร้าง, งานแล้วเสร็จ</p>
              </div>
              <button
                type="button"
                onClick={addGalleryPhoto}
                className="bg-blue-50 text-[#0b4a74] hover:bg-blue-100 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
              >
                <span>+</span> เพิ่มรูปภาพขั้นตอน
              </button>
            </div>

            {galleryPhotos.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-semibold mb-3">ยังไม่ได้เพิ่มรูปภาพขั้นตอนการทำงาน</p>
                <button
                  type="button"
                  onClick={addGalleryPhoto}
                  className="text-xs font-bold text-[#1e90ff] hover:underline"
                >
                  + คลิกที่นี่เพื่อเพิ่มรูปภาพแรกในอัลบั้ม
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {galleryPhotos.map((item, index) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      {item.url ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 shrink-0">
                          <Image src={item.url} alt="Gallery item" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-white shrink-0 flex items-center justify-center text-xs text-slate-400">
                          ไม่มีรูป
                        </div>
                      )}
                      <div className="space-y-2 flex-1">
                        <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-lg inline-block transition">
                          เลือกรูปภาพ
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => updateGalleryPhoto(item.id, 'file', e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="หรือกรอก URL รูปภาพ"
                          value={item.url}
                          onChange={e => updateGalleryPhoto(item.id, 'url', e.target.value)}
                          className="w-full h-8 bg-white border border-slate-200 rounded-lg px-2 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex-1 md:w-56">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          คำอธิบายรูป (Label)
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น แบบ 3D ด้านหน้า, งานฐานราก"
                          value={item.label}
                          onChange={e => updateGalleryPhoto(item.id, 'label', e.target.value)}
                          className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs font-semibold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGalleryPhoto(item.id)}
                        className="text-red-500 hover:text-red-700 p-2 text-sm mt-4 md:mt-0"
                        title="ลบรูปนี้"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/admin/projects"
              className="px-6 py-4 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-10 py-4 bg-[#1e90ff] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin text-lg">🌀</span> กำลังบันทึกข้อมูล...
                </>
              ) : (
                '💾 บันทึกผลงานใหม่'
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}
