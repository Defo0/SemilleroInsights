# 📚 Guía Completa: Configuración de Google Classroom para Semillero Insights

Esta guía te ayudará a configurar un entorno de Google Classroom con datos de prueba que simule la estructura real de Semillero Digital.

## 🎯 Objetivo

Crear una clase de Google Classroom con:
- **144 estudiantes** organizados en **8 células** de ~18 estudiantes cada una
- **4 profesores** (1 coordinador + 3 profesores de práctica)
- **6-8 tareas** con diferentes estados de entrega
- **Datos realistas** que permitan probar todas las funcionalidades

## 📋 Paso 1: Preparación de Cuentas

### Cuentas Necesarias

**Coordinador (tu cuenta principal):**
- `tu-email@gmail.com` (administrador de la clase)

**Profesores de Práctica:**
- `profesor1.semillero@gmail.com`
- `profesor2.semillero@gmail.com` 
- `profesor3.semillero@gmail.com`

**Estudiantes (usando Gmail con +):**
```
Célula A (Profesor 1):
- alumno1.semillero+1@gmail.com
- alumno2.semillero+2@gmail.com
- alumno3.semillero+3@gmail.com
- ... hasta alumno18.semillero+18@gmail.com

Célula B (Profesor 2):
- alumno19.semillero+19@gmail.com
- alumno20.semillero+20@gmail.com
- ... hasta alumno36.semillero+36@gmail.com

Célula C (Profesor 3):
- alumno37.semillero+37@gmail.com
- ... hasta alumno54.semillero+54@gmail.com

Célula D-H (Coordinador supervisa):
- alumno55.semillero+55@gmail.com
- ... hasta alumno144.semillero+144@gmail.com
```

### Crear Cuentas Rápidamente

**Opción 1: Usar Gmail con alias (+)**
- Una sola cuenta base: `semillero.test@gmail.com`
- Crear alias: `semillero.test+alumno1@gmail.com`, etc.
- Gmail tratará todos como la misma cuenta pero Classroom los verá como diferentes

**Opción 2: Usar Google Workspace for Education (Recomendado)**
- Crear un dominio de prueba
- Generar cuentas masivamente

## 📚 Paso 2: Crear la Clase en Google Classroom

### 2.1 Configuración Básica

1. Ve a [classroom.google.com](https://classroom.google.com)
2. Haz clic en **"+"** → **"Crear clase"**
3. Completa los datos:
   - **Nombre:** "Semillero Digital - E-commerce y Data Analytics"
   - **Sección:** "Cohorte 2024 - Módulo 1"
   - **Materia:** "Desarrollo Digital y Análisis de Datos"
   - **Aula:** "Virtual - Plataforma Semillero"

### 2.2 Invitar Profesores

1. Ve a la pestaña **"Personas"**
2. Haz clic en **"Invitar profesores"**
3. Agrega los emails de los 3 profesores de práctica
4. Asigna permisos de **"Profesor"** (no administrador)

### 2.3 Invitar Estudiantes Masivamente

**Opción A: Invitación por Email**
1. Ve a **"Personas"** → **"Estudiantes"**
2. Haz clic en **"Invitar estudiantes"**
3. Copia y pega todos los emails de estudiantes (separados por comas)

**Opción B: Código de Clase**
1. Ve a **"Configuración"** → **"General"**
2. Copia el **código de clase**
3. Comparte el código con los estudiantes para que se unan

## 📝 Paso 3: Crear Tareas Realistas

### 3.1 Estructura de Tareas Sugerida

**Tarea 1: "Fundamentos de HTML y CSS"**
- **Fecha de entrega:** Hace 1 semana (vencida)
- **Puntos:** 100
- **Descripción:** "Crear una página web básica con HTML5 y CSS3"
- **Estado objetivo:** 85% entregado, 15% sin entregar

**Tarea 2: "JavaScript Básico - Variables y Funciones"**
- **Fecha de entrega:** Hace 3 días (vencida)
- **Puntos:** 80
- **Descripción:** "Ejercicios prácticos de JavaScript básico"
- **Estado objetivo:** 70% entregado, 20% tarde, 10% sin entregar

**Tarea 3: "Responsive Design con Flexbox"**
- **Fecha de entrega:** Mañana
- **Puntos:** 90
- **Descripción:** "Diseño responsive usando CSS Flexbox y Grid"
- **Estado objetivo:** 60% entregado, 40% en progreso

**Tarea 4: "Análisis de Datos con Excel"**
- **Fecha de entrega:** En 3 días
- **Puntos:** 100
- **Descripción:** "Análisis estadístico básico de datos de e-commerce"
- **Estado objetivo:** 30% entregado, 70% asignado

**Tarea 5: "Proyecto E-commerce - Wireframes"**
- **Fecha de entrega:** En 1 semana
- **Puntos:** 120
- **Descripción:** "Diseñar wireframes para tienda online"
- **Estado objetivo:** 10% entregado, 90% asignado

**Tarea 6: "Dashboard de Métricas"**
- **Fecha de entrega:** En 2 semanas
- **Puntos:** 150
- **Descripción:** "Crear dashboard interactivo con datos de ventas"
- **Estado objetivo:** 5% entregado, 95% asignado

### 3.2 Crear las Tareas

Para cada tarea:

1. Ve a **"Trabajo de clase"**
2. Haz clic en **"Crear"** → **"Tarea"**
3. Completa:
   - **Título:** [Nombre de la tarea]
   - **Descripción:** [Descripción detallada]
   - **Puntos:** [Puntuación]
   - **Fecha de entrega:** [Según cronograma]
   - **Hora de entrega:** 23:59
4. **Asignar a:** Todos los estudiantes
5. Haz clic en **"Asignar"**

## 👥 Paso 4: Simular Entregas de Estudiantes

### 4.1 Estrategia de Simulación

Para cada tarea, necesitas simular diferentes estados:

**Estados a simular:**
- ✅ **Entregado a tiempo** (60-80%)
- ⏰ **Entregado tarde** (10-20%)
- ❌ **Sin entregar** (5-15%)
- 📝 **Evaluado** (30-50% de los entregados)

### 4.2 Proceso de Simulación

**Para cada estudiante:**

1. **Iniciar sesión** con la cuenta del estudiante
2. **Ir a la clase** usando el código de clase
3. **Ver la tarea** en "Trabajo de clase"
4. **Simular entrega:**
   - Subir un archivo de prueba (PDF, DOC, etc.)
   - Agregar un comentario opcional
   - Hacer clic en "Entregar"

**Para entregas tardías:**
- Cambiar la fecha del sistema temporalmente, O
- Usar la función de "Marcar como entregado tarde" del profesor

### 4.3 Automatización con Google Apps Script (Opcional)

Si tienes muchos estudiantes, puedes usar Google Apps Script:

```javascript
function simulateSubmissions() {
  // Script para automatizar entregas masivas
  // (Requiere permisos de administrador)
}
```

## 📊 Paso 5: Evaluar y Calificar

### 5.1 Proceso de Calificación

Como **profesor**, para cada tarea:

1. Ve a **"Trabajo de clase"** → **[Tarea]**
2. Haz clic en **"Ver tarea"**
3. Para cada entrega:
   - **Calificar:** Asignar puntos (70-100 para buenas entregas)
   - **Comentario:** Feedback constructivo
   - **Estado:** Devuelto con calificación

### 5.2 Distribución de Calificaciones Sugerida

**Para simular realismo:**
- **Excelente (90-100 puntos):** 20% de estudiantes
- **Bueno (80-89 puntos):** 40% de estudiantes  
- **Regular (70-79 puntos):** 30% de estudiantes
- **Necesita mejorar (60-69 puntos):** 10% de estudiantes

## 🔧 Paso 6: Configurar Permisos de API

### 6.1 Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto: **"Semillero Insights"**
3. Habilita las APIs:
   - **Google Classroom API**
   - **Google Drive API** (para archivos)
   - **Google Calendar API** (para asistencia)

### 6.2 Configurar OAuth 2.0

1. Ve a **"Credenciales"** → **"Crear credenciales"** → **"ID de cliente OAuth 2.0"**
2. Tipo de aplicación: **"Aplicación web"**
3. **Orígenes autorizados:**
   - `http://localhost:5173` (desarrollo)
   - `https://semillero-insights.vercel.app` (producción)
4. **URIs de redirección:**
   - `http://localhost:5173/auth/callback`
   - `https://semillero-insights.vercel.app/auth/callback`

### 6.3 Scopes Necesarios

```
https://www.googleapis.com/auth/classroom.courses.readonly
https://www.googleapis.com/auth/classroom.rosters.readonly
https://www.googleapis.com/auth/classroom.coursework.students.readonly
https://www.googleapis.com/auth/classroom.student-submissions.students.readonly
```

## 🧪 Paso 7: Probar la Integración

### 7.1 Verificar Datos

1. **Ejecutar sincronización** en la aplicación
2. **Verificar en Supabase:**
   - Tabla `courses`: 1 curso
   - Tabla `students`: 144 estudiantes
   - Tabla `assignments`: 6 tareas
   - Tabla `submissions`: ~864 entregas (144 × 6)

### 7.2 Métricas Esperadas

**Dashboard del Coordinador debería mostrar:**
- **Total estudiantes:** 144
- **Cursos activos:** 1
- **Tareas totales:** 6
- **Tasa de completitud:** ~75%
- **Entregas a tiempo:** ~520
- **Entregas tardías:** ~130
- **Sin entregar:** ~214

## 🎯 Paso 8: Crear Células en la Base de Datos

Una vez sincronizados los datos, ejecutar en Supabase:

```sql
-- Crear células
INSERT INTO cells (name, color, description) VALUES
('Célula A - Frontend', '#50c69a', 'Especialización en desarrollo frontend'),
('Célula B - Backend', '#fa8534', 'Especialización en desarrollo backend'),
('Célula C - Data Analytics', '#ed3f70', 'Especialización en análisis de datos'),
('Célula D - UX/UI', '#2ec69d', 'Especialización en diseño de experiencia'),
('Célula E - E-commerce', '#af77f4', 'Especialización en comercio electrónico'),
('Célula F - Marketing Digital', '#fe7ea1', 'Especialización en marketing digital'),
('Célula G - DevOps', '#fcaf79', 'Especialización en DevOps y deployment'),
('Célula H - Mobile', '#5a25ab', 'Especialización en desarrollo móvil');

-- Asignar estudiantes a células (18 por célula)
-- Esto se puede hacer manualmente o con un script
```

## ✅ Checklist Final

- [ ] Clase de Google Classroom creada
- [ ] 144 estudiantes invitados y aceptados
- [ ] 3 profesores agregados
- [ ] 6 tareas creadas con fechas realistas
- [ ] Entregas simuladas (diferentes estados)
- [ ] Calificaciones asignadas
- [ ] API de Google Classroom habilitada
- [ ] OAuth 2.0 configurado
- [ ] Sincronización funcionando
- [ ] Células creadas en base de datos
- [ ] Métricas del dashboard correctas

## 🚀 Próximos Pasos

Una vez completada la configuración:

1. **Probar sincronización completa**
2. **Verificar dashboards del coordinador y profesor**
3. **Configurar notificaciones automáticas**
4. **Implementar sistema de roles**
5. **Agregar funcionalidades de células**

---

**¿Necesitas ayuda?** Revisa los logs de la aplicación o contacta al equipo de desarrollo.
