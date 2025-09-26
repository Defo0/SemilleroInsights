import { ReactNode, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../lib/userService'
import { 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Users, 
  BookOpen,
  Bell
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
  session: Session
  user: UserProfile
}

export default function Layout({ children, session, user }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Navegación basada en el rol del usuario
  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/', icon: Home, current: true },
    ]

    if (user.role === 'coordinator') {
      return [
        ...baseNavigation,
        { name: 'Vista Coordinador', href: '/coordinator', icon: BarChart3, current: false },
        { name: 'Cursos', href: '/courses', icon: BookOpen, current: false },
        { name: 'Estudiantes', href: '/students', icon: Users, current: false },
        { name: 'Notificaciones', href: '/notifications', icon: Bell, current: false },
      ]
    } else {
      return [
        ...baseNavigation,
        { name: 'Mis Células', href: '/professor', icon: Users, current: false },
        { name: 'Notificaciones', href: '/notifications', icon: Bell, current: false },
      ]
    }
  }

  const navigation = getNavigation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/thumbnail_sin_fondo.png" 
                  alt="Semillero Digital Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-gray-900">Semillero Insights</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex h-16 shrink-0 items-center px-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/thumbnail_sin_fondo.png" 
                  alt="Semillero Digital Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-gray-900">Semillero Insights</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col px-4">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User menu */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name || session.user.user_metadata?.full_name || session.user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role === 'coordinator' ? 'Coordinador' : 'Profesor'} • {session.user.email}
                  </p>
                </div>
                {session.user.user_metadata?.avatar_url && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={session.user.user_metadata.avatar_url}
                    alt="Avatar"
                  />
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
