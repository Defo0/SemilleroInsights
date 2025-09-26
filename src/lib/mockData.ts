// Datos mockeados espectaculares para la demo
// Basados en el contexto real de Semillero Digital

export const mockCoordinatorData = {
  totalCourses: 3,
  totalStudents: 144,
  totalAssignments: 24,
  totalSubmissions: 2880,
  completedSubmissions: 2246,
  lateSubmissions: 432,
  completionRate: 78,
  courses: [
    {
      id: '1',
      name: 'E-commerce y Data Analytics',
      section: 'Cohorte 2024-2',
      studentCount: 144,
      assignmentCount: 8,
      completionRate: 78
    },
    {
      id: '2', 
      name: 'Desarrollo Frontend',
      section: 'Módulo React',
      studentCount: 48,
      assignmentCount: 10,
      completionRate: 85
    },
    {
      id: '3',
      name: 'Backend y APIs',
      section: 'Módulo Node.js',
      studentCount: 36,
      assignmentCount: 6,
      completionRate: 72
    }
  ],
  weeklyProgress: [
    { week: 'Sem 1', completadas: 180, tardias: 45 },
    { week: 'Sem 2', completadas: 220, tardias: 38 },
    { week: 'Sem 3', completadas: 195, tardias: 52 },
    { week: 'Sem 4', completadas: 240, tardias: 28 },
    { week: 'Sem 5', completadas: 210, tardias: 41 },
    { week: 'Sem 6', completadas: 235, tardias: 35 }
  ],
  cellMetrics: [
    {
      name: 'Frontend Avanzado',
      students: 8,
      completedTasks: 45,
      pendingTasks: 12,
      professor: 'Prof. García',
      completionRate: 79
    },
    {
      name: 'Backend & APIs',
      students: 8,
      completedTasks: 52,
      pendingTasks: 8,
      professor: 'Prof. Martínez',
      completionRate: 87
    },
    {
      name: 'Data Analytics',
      students: 8,
      completedTasks: 38,
      pendingTasks: 18,
      professor: 'Prof. López',
      completionRate: 68
    },
    {
      name: 'UX/UI Design',
      students: 8,
      completedTasks: 41,
      pendingTasks: 15,
      professor: 'Prof. Rodríguez',
      completionRate: 73
    },
    {
      name: 'DevOps & Cloud',
      students: 8,
      completedTasks: 48,
      pendingTasks: 10,
      professor: 'Prof. Fernández',
      completionRate: 83
    }
  ]
}

export const mockProfessorData = {
  courses: [
    {
      id: '1',
      name: 'E-commerce y Data Analytics',
      section: 'Célula Frontend Avanzado',
      students: [
        {
          userId: '1',
          profile: {
            name: { fullName: 'Ana García Mendoza' },
            emailAddress: 'ana.garcia@estudiante.com',
            photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
          },
          completedTasks: 7,
          totalTasks: 8,
          completionRate: 88,
          lastActivity: '2024-01-15',
          averageGrade: 8.5
        },
        {
          userId: '2',
          profile: {
            name: { fullName: 'Carlos Rodríguez Silva' },
            emailAddress: 'carlos.rodriguez@estudiante.com',
            photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
          },
          completedTasks: 6,
          totalTasks: 8,
          completionRate: 75,
          lastActivity: '2024-01-14',
          averageGrade: 7.8
        },
        {
          userId: '3',
          profile: {
            name: { fullName: 'María Fernández López' },
            emailAddress: 'maria.fernandez@estudiante.com',
            photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
          },
          completedTasks: 8,
          totalTasks: 8,
          completionRate: 100,
          lastActivity: '2024-01-16',
          averageGrade: 9.2
        },
        {
          userId: '4',
          profile: {
            name: { fullName: 'Diego Martín Torres' },
            emailAddress: 'diego.martin@estudiante.com',
            photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
          },
          completedTasks: 5,
          totalTasks: 8,
          completionRate: 63,
          lastActivity: '2024-01-12',
          averageGrade: 6.9
        },
        {
          userId: '5',
          profile: {
            name: { fullName: 'Sofía Herrera Castro' },
            emailAddress: 'sofia.herrera@estudiante.com',
            photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
          },
          completedTasks: 7,
          totalTasks: 8,
          completionRate: 88,
          lastActivity: '2024-01-15',
          averageGrade: 8.7
        },
        {
          userId: '6',
          profile: {
            name: { fullName: 'Andrés Jiménez Ruiz' },
            emailAddress: 'andres.jimenez@estudiante.com',
            photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
          },
          completedTasks: 6,
          totalTasks: 8,
          completionRate: 75,
          lastActivity: '2024-01-13',
          averageGrade: 7.5
        },
        {
          userId: '7',
          profile: {
            name: { fullName: 'Valentina Morales Díaz' },
            emailAddress: 'valentina.morales@estudiante.com',
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          },
          completedTasks: 8,
          totalTasks: 8,
          completionRate: 100,
          lastActivity: '2024-01-16',
          averageGrade: 9.0
        },
        {
          userId: '8',
          profile: {
            name: { fullName: 'Sebastián Vargas Peña' },
            emailAddress: 'sebastian.vargas@estudiante.com',
            photoUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150'
          },
          completedTasks: 4,
          totalTasks: 8,
          completionRate: 50,
          lastActivity: '2024-01-10',
          averageGrade: 6.2
        }
      ],
      assignments: [
        {
          id: '1',
          title: 'Proyecto E-commerce con React',
          description: 'Desarrollar una tienda online completa con carrito de compras',
          dueDate: '2024-01-20',
          submissions: 7,
          pending: 1,
          late: 0
        },
        {
          id: '2',
          title: 'Análisis de Datos con Python',
          description: 'Crear dashboard de métricas de ventas',
          dueDate: '2024-01-18',
          submissions: 6,
          pending: 2,
          late: 1
        },
        {
          id: '3',
          title: 'Integración con APIs',
          description: 'Conectar frontend con servicios externos',
          dueDate: '2024-01-25',
          submissions: 5,
          pending: 3,
          late: 0
        }
      ],
      studentCount: 8,
      assignmentCount: 8,
      averageCompletion: 78
    }
  ],
  totalStudents: 8,
  totalAssignments: 8,
  recentActivity: [
    {
      student: 'María Fernández López',
      action: 'Entregó tarea',
      assignment: 'Proyecto E-commerce con React',
      time: '2024-01-16 14:30',
      status: 'completed'
    },
    {
      student: 'Ana García Mendoza',
      action: 'Comentario en tarea',
      assignment: 'Análisis de Datos con Python',
      time: '2024-01-16 11:15',
      status: 'comment'
    },
    {
      student: 'Sebastián Vargas Peña',
      action: 'Entrega tardía',
      assignment: 'Integración con APIs',
      time: '2024-01-15 23:45',
      status: 'late'
    }
  ]
}

export const mockStudentData = {
  courses: [
    {
      id: '1',
      name: 'E-commerce y Data Analytics',
      section: 'Cohorte 2024-2',
      assignments: [
        {
          id: '1',
          title: 'Proyecto E-commerce con React',
          description: 'Desarrollar una tienda online completa',
          dueDate: '2024-01-20',
          status: 'turned_in',
          grade: 8.5,
          late: false,
          feedback: 'Excelente trabajo en el diseño de componentes'
        },
        {
          id: '2',
          title: 'Análisis de Datos con Python',
          description: 'Dashboard de métricas de ventas',
          dueDate: '2024-01-18',
          status: 'turned_in',
          grade: 9.0,
          late: false,
          feedback: 'Muy buen uso de librerías de visualización'
        },
        {
          id: '3',
          title: 'Integración con APIs',
          description: 'Conectar frontend con servicios externos',
          dueDate: '2024-01-25',
          status: 'assigned',
          grade: null,
          late: false,
          feedback: null
        },
        {
          id: '4',
          title: 'Base de Datos NoSQL',
          description: 'Implementar MongoDB en el proyecto',
          dueDate: '2024-01-15',
          status: 'turned_in',
          grade: 7.8,
          late: true,
          feedback: 'Entrega tardía pero buen contenido'
        },
        {
          id: '5',
          title: 'Testing y QA',
          description: 'Pruebas unitarias y de integración',
          dueDate: '2024-01-30',
          status: 'assigned',
          grade: null,
          late: false,
          feedback: null
        }
      ]
    }
  ],
  totalAssignments: 5,
  completedAssignments: 3,
  lateSubmissions: 1,
  completionRate: 60,
  averageGrade: 8.4,
  weeklyProgress: [
    { week: 'Sem 1', completadas: 1, tardias: 0 },
    { week: 'Sem 2', completadas: 2, tardias: 0 },
    { week: 'Sem 3', completadas: 0, tardias: 1 },
    { week: 'Sem 4', completadas: 0, tardias: 0 },
  ],
  recentSubmissions: [
    {
      id: '2',
      title: 'Análisis de Datos con Python',
      submittedAt: '2024-01-17 16:30',
      grade: 9.0,
      status: 'graded',
      late: false
    },
    {
      id: '1',
      title: 'Proyecto E-commerce con React',
      submittedAt: '2024-01-19 14:20',
      grade: 8.5,
      status: 'graded',
      late: false
    },
    {
      id: '4',
      title: 'Base de Datos NoSQL',
      submittedAt: '2024-01-16 23:45',
      grade: 7.8,
      status: 'graded',
      late: true
    }
  ],
  upcomingDeadlines: [
    {
      id: '3',
      title: 'Integración con APIs',
      dueDate: '2024-01-25',
      daysLeft: 3
    },
    {
      id: '5',
      title: 'Testing y QA',
      dueDate: '2024-01-30',
      daysLeft: 8
    }
  ]
}
