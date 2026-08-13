export interface ProjectPhoto {
  id: string
  project_id: string
  img: string
  label: string
  display_order: number
  created_at?: string
}

export interface Project {
  id: string
  title: string
  category: string
  location: string
  desc?: string
  description?: string
  year: string
  type: string
  cover_image: string
  created_at?: string
  photos?: ProjectPhoto[]
}

export interface ContactMessage {
  id: string
  name: string
  phone: string
  detail: string
  status: 'new' | 'contacted' | 'archived'
  created_at: string
}

export interface QueueItem {
  id: string
  project_name: string
  client_name: string
  location: string
  start_date?: string
  estimated_end_date?: string
  status: 'queued' | 'in_progress' | 'completed' | 'paused'
  progress_percent: number
  queue_order: number
  created_at?: string
}

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'photos'> & { id?: string }
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'photos'>>
      }
      project_photos: {
        Row: ProjectPhoto
        Insert: Omit<ProjectPhoto, 'id' | 'created_at'> & { id?: string }
        Update: Partial<Omit<ProjectPhoto, 'id' | 'created_at'>>
      }
    }
  }
}
