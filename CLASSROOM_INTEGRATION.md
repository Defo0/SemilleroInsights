# 🎓 Integración con Google Classroom - Documentación Técnica

## 📋 Resumen

**Semillero Insights** utiliza una integración 100% real con la API de Google Classroom para obtener datos en tiempo real de cursos, estudiantes, profesores y tareas. Esta documentación detalla la implementación técnica y las funcionalidades disponibles.

---

## 🏗️ Arquitectura del Servicio

### **SimpleClassroomService**
Servicio singleton que maneja toda la comunicación con Google Classroom API de forma simple y eficiente.

```typescript
export class SimpleClassroomService {
  private static instance: SimpleClassroomService
  private accessToken: string | null = null
  
  // Métodos principales
  - detectUserRole(userEmail: string): Promise<SimpleUserRole>
  - getCourses(): Promise<SimpleCourse[]>
  - getStudentsInCourse(courseId: string): Promise<any[]>
  - getAssignmentsInCourse(courseId: string): Promise<SimpleAssignment[]>
  - getSubmissionsForAssignment(courseId: string, assignmentId: string): Promise<SimpleSubmission[]>
}
```

---

## 🔐 Autenticación y Permisos

### **Scopes Requeridos**
```javascript
const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly'
]
```

### **Detección Automática de Roles**
El sistema detecta automáticamente el rol del usuario basándose en:

1. **Coordinadores Hardcodeados**:
   - `moreno.moreno04@gmail.com`
   - `coordinador@semillerodigital.com`

2. **Profesores Hardcodeados**:
   - `semilleroinsights@gmail.com`
   - `vibeathonprofe@gmail.com`

3. **Detección Dinámica**:
   - Verifica si el usuario es profesor en algún curso
   - Verifica si el usuario es estudiante en algún curso
   - Por defecto asigna rol de estudiante

---

## 📊 Dashboards por Rol

### 🎛️ **Dashboard del Coordinador**
```typescript
async getCoordinatorData(): Promise<any>
```

**Funcionalidades**:
- Vista completa de todos los cursos
- Métricas globales de estudiantes y tareas
- Análisis de completitud de entregas
- Identificación de cursos con bajo rendimiento

**Datos Retornados**:
```typescript
{
  totalCourses: number,
  totalStudents: number,
  totalAssignments: number,
  totalSubmissions: number,
  completedSubmissions: number,
  completionRate: number,
  courses: CourseWithDetails[],
  weeklyProgress: WeeklyProgress[],
  cellMetrics: CellMetric[]
}
```

### 👨‍🏫 **Dashboard del Profesor**
```typescript
async getProfessorData(professorEmail: string): Promise<any>
```

**Funcionalidades**:
- Vista filtrada de cursos donde es profesor
- Seguimiento de estudiantes asignados
- Métricas específicas por curso
- Actividad reciente de estudiantes

**Datos Retornados**:
```typescript
{
  courses: CourseWithStudentsAndAssignments[],
  totalStudents: number,
  totalAssignments: number,
  recentActivity: Activity[]
}
```

### 👨‍🎓 **Dashboard del Estudiante**
```typescript
async getStudentData(studentEmail: string): Promise<any>
```

**Funcionalidades**:
- Vista personal de cursos inscritos
- Progreso individual de tareas
- Próximas fechas de entrega
- Historial de entregas

**Datos Retornados**:
```typescript
{
  courses: CourseWithAssignments[],
  totalAssignments: number,
  completedAssignments: number,
  completionRate: number,
  averageGrade: number,
  weeklyProgress: WeeklyProgress[],
  recentSubmissions: Submission[],
  upcomingDeadlines: Deadline[]
}
```

---

## 🔄 Sincronización de Datos

### **Proceso de Sincronización**
1. **Autenticación**: Verificar token de acceso válido
2. **Obtener Cursos**: Listar todos los cursos activos
3. **Procesar por Curso**:
   - Obtener lista de estudiantes
   - Obtener lista de tareas
   - Obtener entregas por tarea
4. **Calcular Métricas**: Procesar datos y generar estadísticas
5. **Retornar Resultados**: Estructurar datos para el frontend

### **Manejo de Errores**
```typescript
try {
  const data = await this.fetchFromClassroom(endpoint)
  return processData(data)
} catch (error) {
  console.error('Error fetching data:', error)
  return fallbackData
}
```

---

## 📈 Métricas Calculadas

### **Métricas Globales**
- **Total de Cursos**: Número de cursos activos
- **Total de Estudiantes**: Suma de estudiantes únicos
- **Total de Tareas**: Suma de todas las asignaciones
- **Tasa de Completitud**: Porcentaje de entregas completadas

### **Métricas por Curso**
- **Número de Estudiantes**: Estudiantes inscritos en el curso
- **Número de Tareas**: Asignaciones creadas en el curso
- **Entregas Totales**: Número total de entregas
- **Entregas Completadas**: Entregas con estado 'TURNED_IN'
- **Entregas Tardías**: Entregas marcadas como 'late'

### **Métricas por Estudiante**
- **Progreso Individual**: Porcentaje de tareas completadas
- **Promedio de Calificaciones**: Media de calificaciones obtenidas
- **Entregas Tardías**: Número de entregas fuera de plazo

---

## 🛠️ Implementación Técnica

### **Estructura de Datos**

```typescript
export interface SimpleCourse {
  id: string
  name: string
  section?: string
  courseState: string
}

export interface SimpleAssignment {
  id: string
  title: string
  description?: string
  dueDate?: string
  courseId: string
  courseName?: string
}

export interface SimpleSubmission {
  id: string
  assignmentId: string
  studentId: string
  state: string
  late: boolean
  assignedGrade?: number
  submissionHistory?: any[]
}
```

### **Llamadas a la API**

```typescript
private async fetchFromClassroom(endpoint: string) {
  const response = await fetch(`https://classroom.googleapis.com/v1/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Classroom API error: ${response.status}`)
  }
  
  return response.json()
}
```

---

## 🔧 Configuración y Setup

### **Variables de Entorno Requeridas**
```env
VITE_GOOGLE_CLIENT_ID=tu_client_id_de_google
```

### **Configuración en Google Cloud Console**
1. Habilitar Google Classroom API
2. Crear credenciales OAuth 2.0
3. Configurar dominios autorizados
4. Agregar scopes necesarios

### **Configuración en Supabase**
1. Habilitar Google OAuth
2. Configurar redirect URLs
3. Agregar Client ID y Client Secret

---

## 🧪 Testing y Debugging

### **Logs de Debugging**
El servicio incluye logging extensivo para facilitar el debugging:

```typescript
console.log(`🔍 Detectando rol para: ${userEmail}`)
console.log(`📚 Encontrados ${courses.length} cursos`)
console.log(`👥 ${students.length} estudiantes en ${course.name}`)
console.log(`📝 ${assignments.length} tareas en ${course.name}`)
```

### **Casos de Prueba**
1. **Login con diferentes roles**: Coordinador, Profesor, Estudiante
2. **Sincronización de datos**: Verificar que los datos se obtienen correctamente
3. **Manejo de errores**: Probar con tokens inválidos o permisos insuficientes
4. **Performance**: Medir tiempos de respuesta con diferentes volúmenes de datos

---

## 🚀 Optimizaciones Futuras

### **Mejoras Planificadas**
- [ ] **Caché de Datos**: Implementar caché para reducir llamadas a la API
- [ ] **Paginación**: Manejar grandes volúmenes de datos con paginación
- [ ] **Webhooks**: Recibir notificaciones en tiempo real de cambios
- [ ] **Batch Processing**: Procesar múltiples cursos en paralelo
- [ ] **Error Recovery**: Reintentos automáticos en caso de fallos temporales

### **Métricas Avanzadas**
- [ ] **Análisis Predictivo**: Identificar estudiantes en riesgo
- [ ] **Patrones de Comportamiento**: Analizar horarios de entrega
- [ ] **Comparativas Temporales**: Evolución del rendimiento en el tiempo
- [ ] **Alertas Inteligentes**: Notificaciones basadas en umbrales dinámicos

---

## 📞 Soporte y Contacto

Para problemas técnicos relacionados con la integración de Google Classroom:

1. **Revisar Logs**: Verificar console.log en el navegador
2. **Verificar Permisos**: Asegurar que los scopes estén correctos
3. **Probar Conectividad**: Verificar acceso a classroom.googleapis.com
4. **Documentación**: Consultar [Google Classroom API Docs](https://developers.google.com/classroom)

---

**✅ Estado Actual**: Integración 100% funcional con Google Classroom API  
**🔄 Última Actualización**: 26 de Septiembre, 2024  
**👤 Roles Soportados**: Coordinador, Profesor, Estudiante  
**🎯 Cobertura**: Cursos, Estudiantes, Tareas, Entregas, Calificaciones
