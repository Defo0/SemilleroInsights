export interface User {
  id: string
  email: string
  name: string
  role: 'coordinator' | 'professor'
  avatar_url?: string
  created_at: string
}

export interface Cell {
  id: string
  name: string
  description?: string
  color?: string
  created_at: string
}

export interface ProfessorCell {
  id: string
  professor_id: string
  cell_id: string
  created_at: string
  cell?: Cell
}

export interface StudentCell {
  id: string
  student_id: string
  cell_id: string
  created_at: string
  cell?: Cell
  student?: Student
}

export interface Student {
  id: string
  classroom_id: string
  name: string
  email: string
  created_at: string
}

export interface Course {
  id: string
  classroom_id: string
  name: string
  description?: string
  enrollment_code?: string
  teacher_name?: string
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
  max_points?: number
  created_at: string
  updated_at: string
  course?: Course
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  status: 'turned_in' | 'returned' | 'reclaimed_by_student' | 'new' | 'missing'
  grade?: number
  submitted_at?: string
  created_at: string
  updated_at: string
  assignment?: Assignment
  student?: Student
}

export interface DashboardMetrics {
  totalStudents: number
  totalCourses: number
  totalAssignments: number
  completionRate: number
  onTimeSubmissions: number
  lateSubmissions: number
  missingSubmissions: number
}

export interface CellMetrics {
  cellId: string
  cellName: string
  studentCount: number
  completionRate: number
  averageGrade: number
  onTimeRate: number
}

export interface AssignmentMetrics {
  assignmentId: string
  title: string
  dueDate?: string
  totalSubmissions: number
  totalStudents: number
  completionRate: number
  averageGrade: number
  onTimeSubmissions: number
  lateSubmissions: number
}

export interface WeeklyProgress {
  week: string
  submissions: number
  target: number
  completionRate: number
}
