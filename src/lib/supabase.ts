import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: window.location.origin,
    persistSession: true,
  }
})

// Tipos para la base de datos
export interface User {
  id: string
  email: string
  name: string
  role: 'coordinator' | 'professor'
  created_at: string
}

export interface Cell {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface ProfessorCell {
  id: string
  professor_id: string
  cell_id: string
  created_at: string
}

export interface StudentCell {
  id: string
  student_id: string
  cell_id: string
  created_at: string
}

export interface ClassroomCourse {
  id: string
  classroom_id: string
  name: string
  description?: string
  enrollment_code?: string
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  course_id: string
  classroom_id: string
  title: string
  description?: string
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  status: 'turned_in' | 'returned' | 'reclaimed_by_student' | 'new'
  grade?: number
  submitted_at?: string
  created_at: string
  updated_at: string
}
