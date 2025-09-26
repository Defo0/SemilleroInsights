import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function getStatusColor(status: string): string {
  const colors = {
    'turned_in': 'text-green-600 bg-green-100',
    'returned': 'text-blue-600 bg-blue-100',
    'reclaimed_by_student': 'text-yellow-600 bg-yellow-100',
    'new': 'text-gray-600 bg-gray-100',
    'missing': 'text-red-600 bg-red-100'
  }
  return colors[status as keyof typeof colors] || colors.new
}

export function getStatusText(status: string): string {
  const texts = {
    'turned_in': 'Entregado',
    'returned': 'Devuelto',
    'reclaimed_by_student': 'Reclamado',
    'new': 'Pendiente',
    'missing': 'No entregado'
  }
  return texts[status as keyof typeof texts] || 'Desconocido'
}
