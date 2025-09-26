# 🎯 Setup Simplificado de Google Classroom - Demo Rápido

## 📋 Configuración Mínima para Demostración

### Cuentas Necesarias (Solo 3):
- **Admin/Coordinador:** `tu-email@gmail.com` (administrador de la clase)
- **Profesor:** `profesor.demo@gmail.com` (o cualquier Gmail que tengas)
- **Estudiante:** `estudiante.demo@gmail.com` (o cualquier Gmail que tengas)

## 🚀 Paso 1: Crear la Clase

1. Ve a [classroom.google.com](https://classroom.google.com) con tu cuenta admin
2. Crear clase:
   - **Nombre:** "Semillero Digital - Demo"
   - **Sección:** "Prueba Integración"
   - **Materia:** "Desarrollo Digital"

## 👥 Paso 2: Invitar Usuarios

### Invitar Profesor:
1. Pestaña **"Personas"** → **"Invitar profesores"**
2. Agregar email del profesor
3. Aceptar invitación desde la cuenta del profesor

### Invitar Estudiante:
1. Pestaña **"Personas"** → **"Invitar estudiantes"**  
2. Agregar email del estudiante
3. Aceptar invitación desde la cuenta del estudiante

## 📝 Paso 3: Crear Tareas de Demo (3-4 tareas)

### Tarea 1: "HTML Básico" (Vencida - Con entrega)
- **Puntos:** 100
- **Fecha:** Hace 3 días
- **Estado:** Estudiante debe entregar algo (archivo o texto)

### Tarea 2: "CSS Flexbox" (Activa - Sin entregar)
- **Puntos:** 80  
- **Fecha:** Mañana
- **Estado:** Asignada pero sin entregar

### Tarea 3: "JavaScript Variables" (Futura)
- **Puntos:** 90
- **Fecha:** En 5 días
- **Estado:** Solo asignada

### Tarea 4: "Proyecto Final" (Opcional)
- **Puntos:** 150
- **Fecha:** En 2 semanas
- **Estado:** Solo asignada

## 🎭 Paso 4: Simular Estados Realistas

### Como Estudiante:
1. **Tarea 1:** Entregar un archivo (PDF, DOC, o texto)
2. **Tarea 2:** Dejar sin entregar
3. **Tarea 3 y 4:** Solo ver, no entregar

### Como Profesor:
1. **Tarea 1:** Calificar la entrega (ej: 85/100)
2. **Tarea 2:** Dejar sin calificar
3. Agregar comentarios opcionales

## 🔧 Paso 5: Configurar OAuth (Si no está hecho)

### Google Cloud Console:
1. Proyecto: "Semillero Insights"
2. APIs habilitadas: Google Classroom API
3. OAuth 2.0 configurado con:
   - **Orígenes:** `https://semillero-insights.vercel.app`
   - **Redirección:** `https://semillero-insights.vercel.app/auth/callback`

### Scopes necesarios:
```
https://www.googleapis.com/auth/classroom.courses.readonly
https://www.googleapis.com/auth/classroom.rosters.readonly  
https://www.googleapis.com/auth/classroom.coursework.students.readonly
https://www.googleapis.com/auth/classroom.student-submissions.students.readonly
```

## 🧪 Paso 6: Probar la Integración

### En la Aplicación:
1. **Login** con la cuenta admin
2. **Cambiar a "Modo Datos Reales"**
3. **Hacer clic en "Sincronizar con Classroom"**
4. **Verificar que aparecen:**
   - 1 curso
   - 1 estudiante  
   - 3-4 tareas
   - Estados de entrega correctos

### Datos Esperados en Dashboard:
- **Total Estudiantes:** 1
- **Cursos Activos:** 1
- **Tareas Totales:** 3-4
- **Tasa de Completitud:** 25-33% (1 de 3-4 tareas)

## 🎯 Paso 7: Crear Célula Simple

### Después de sincronizar:
1. **Usar "Gestión de Células"** → **"Crear Células"**
2. **Resultado esperado:**
   - 1 célula creada
   - 1 estudiante asignado
   - 1 profesor asignado

## ✅ Checklist Rápido

- [ ] Clase creada en Google Classroom
- [ ] 1 profesor y 1 estudiante invitados
- [ ] 3-4 tareas creadas con fechas variadas
- [ ] 1 tarea entregada y calificada
- [ ] OAuth configurado correctamente
- [ ] Sincronización funcionando
- [ ] Dashboard mostrando datos reales
- [ ] Célula creada automáticamente

## 🎬 Script para Demo

### Mostrar Modo Mock:
1. "Aquí vemos datos de ejemplo con 144 estudiantes"
2. "Esto simula la escala real de Semillero Digital"

### Cambiar a Modo Real:
1. "Ahora vamos a conectar con Google Classroom real"
2. "Tengo configurada una clase de prueba"
3. **Clic en toggle** → "Usar Datos Reales"

### Sincronizar:
1. "Vamos a sincronizar los datos en tiempo real"
2. **Clic en "Sincronizar"**
3. "Pueden ver el estado de la sincronización aquí"

### Mostrar Resultados:
1. "Ahora el dashboard muestra datos reales de Google Classroom"
2. "Tenemos 1 estudiante, 1 curso, 4 tareas"
3. "La tasa de completitud refleja las entregas reales"

### Crear Células:
1. "Ahora vamos a organizar automáticamente en células"
2. **Clic en "Crear Células"**
3. "El sistema distribuye estudiantes y asigna profesores"

## 🚀 Ventajas de este Setup

✅ **Rápido de configurar** (15-20 minutos)
✅ **Demuestra integración real** con Google Classroom
✅ **Muestra escalabilidad** con modo mock
✅ **Funcionalidad completa** en entorno controlado
✅ **Perfecto para demo** de hackathon

---

**¡Con esto tienes una demo funcional que muestra la integración real sin la complejidad de 144 cuentas!**
