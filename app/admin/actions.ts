'use server'

import { createClient } from '@/lib/supabase/server'
import { Project } from '@/lib/supabase/types'

// 1. ดึงข้อมูลผลงานโครงการจาก Server Side
export async function getProjectsAction(): Promise<{ projects: Project[]; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase.from('projects') as any)
      .select('*, photos:project_photos(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Server action fetch projects error:', error.message)
      return { projects: [], error: error.message }
    }
    return { projects: (data as Project[]) || [], error: null }
  } catch (err: any) {
    console.error('Server action fetch projects exception:', err)
    return { projects: [], error: err?.message || String(err) }
  }
}

// 2. ดึงข้อมูลตารางคิวงานก่อสร้างจาก Server Side
export async function getQueueAction(): Promise<{ queue: any[]; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase.from('construction_queue') as any)
      .select('*')
      .order('queue_order', { ascending: true })

    if (error) {
      console.error('Server action fetch queue error:', error.message)
      return { queue: [], error: error.message }
    }
    return { queue: data || [], error: null }
  } catch (err: any) {
    return { queue: [], error: err?.message || String(err) }
  }
}

// 3. ดึงข้อมูลข้อความติดต่อจากลูกค้าจาก Server Side
export async function getMessagesAction(): Promise<{ messages: any[]; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase.from('contact_messages') as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Server action fetch messages error:', error.message)
      return { messages: [], error: error.message }
    }
    return { messages: data || [], error: null }
  } catch (err: any) {
    return { messages: [], error: err?.message || String(err) }
  }
}
