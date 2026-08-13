import { createClient } from './client'
import { Project } from './types'

// ข้อมูลสำรอง - ตั้งเป็นอาร์เรย์ว่างเพื่อไม่ให้แสดงผลงาน Mock
export const FALLBACK_PROJECTS: Project[] = []

export async function fetchProjects(): Promise<Project[]> {
  try {
    const supabase = createClient()
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, photos:project_photos(*)')
      .order('created_at', { ascending: false })

    if (error || !projects || projects.length === 0) {
      return []
    }

    return projects.map((p: any) => ({
      ...p,
      photos: (p.photos || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)),
    }))
  } catch (err) {
    console.error('Fetch projects error:', err)
    return []
  }
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  try {
    const supabase = createClient()
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, photos:project_photos(*)')
      .eq('id', id)
      .single()

    if (error || !project) {
      return null
    }

    const projObj = project as any
    return {
      ...projObj,
      photos: (projObj.photos || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)),
    }
  } catch (err) {
    console.error('Fetch project by id error:', err)
    return null
  }
}

export async function fetchQueue(): Promise<any[]> {
  try {
    const supabase = createClient()
    const { data: queue, error } = await (supabase
      .from('construction_queue') as any)
      .select('*')
      .order('queue_order', { ascending: true })

    if (error || !queue) return []
    return queue
  } catch (err) {
    console.error('Fetch queue error:', err)
    return []
  }
}

