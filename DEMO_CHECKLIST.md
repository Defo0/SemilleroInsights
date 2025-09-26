# ✅ Checklist de Demo - Semillero Insights

## 🎯 Configuración Rápida (15 minutos)

### 1. Google Classroom Setup
- [ ] **Clase creada:** "Semillero Digital - Demo"
- [ ] **1 Profesor invitado** y aceptó invitación
- [ ] **1 Estudiante invitado** y aceptó invitación
- [ ] **3-4 Tareas creadas** con fechas variadas
- [ ] **1 Tarea entregada** por el estudiante
- [ ] **1 Tarea calificada** por el profesor

### 2. Verificar OAuth
- [ ] **Google Cloud Console** configurado
- [ ] **Classroom API** habilitada
- [ ] **URLs de redirección** correctas
- [ ] **Scopes** configurados

### 3. Probar Aplicación
- [ ] **Login funciona** con cuenta admin
- [ ] **Modo Mock** muestra datos de ejemplo
- [ ] **Cambio a Modo Real** funciona
- [ ] **Sincronización** se ejecuta sin errores
- [ ] **Dashboard** muestra datos reales

### 4. Verificar Datos Sincronizados
- [ ] **1 Curso** aparece en dashboard
- [ ] **1 Estudiante** aparece en métricas
- [ ] **3-4 Tareas** aparecen en lista
- [ ] **Estados de entrega** son correctos
- [ ] **Calificaciones** se muestran

### 5. Crear Células
- [ ] **"Gestión de Células"** visible
- [ ] **"Crear Células"** funciona
- [ ] **3 Células** creadas
- [ ] **Estudiante asignado** a célula
- [ ] **Profesor asignado** a célula

## 🎬 Script de Presentación (5 minutos)

### Introducción (30 segundos)
```
"Semillero Digital capacita a 144 jóvenes en situación de vulnerabilidad.
Su problema: gestión manual de datos de Google Classroom toma 4 horas/semana.
Nuestra solución: dashboard inteligente que reduce esto a 15 minutos."
```

### Demo Modo Mock (1 minuto)
```
"Primero vemos el dashboard con datos de ejemplo que simula la escala real:
- 144 estudiantes organizados en 8 células
- Métricas de completitud, entregas a tiempo, calificaciones
- Visualizaciones por célula y progreso semanal"
```

### Cambio a Datos Reales (1 minuto)
```
"Ahora vamos a conectar con Google Classroom real:
[Clic en toggle] - Cambiar a 'Usar Datos Reales'
[Clic en Sincronizar] - 'Sincronizar con Classroom'
Pueden ver el estado de la sincronización en tiempo real..."
```

### Mostrar Integración (1.5 minutos)
```
"Perfecto! Ahora el dashboard muestra datos reales:
- 1 curso sincronizado de mi Google Classroom
- 1 estudiante real con sus entregas
- 4 tareas con estados reales (entregada, pendiente, calificada)
- Métricas calculadas automáticamente"
```

### Crear Células (1 minuto)
```
"Ahora organizamos automáticamente en células de aprendizaje:
[Clic en 'Crear Células']
El sistema crea 3 células temáticas y asigna estudiantes y profesores.
En producción esto escalaría a 144 estudiantes en 8 células."
```

### Impacto Social (30 segundos)
```
"Impacto demostrable:
- 94% reducción en tiempo de análisis
- 144 jóvenes con seguimiento personalizado
- 8 células de aprendizaje especializado
- Notificaciones automáticas para profesores"
```

## 🚨 Troubleshooting Rápido

### Si la sincronización falla:
1. **Verificar login** - Cerrar sesión y volver a entrar
2. **Verificar permisos** - Aceptar todos los scopes de Classroom
3. **Revisar consola** - Ver errores en DevTools
4. **Fallback** - Volver a modo mock y explicar que funciona

### Si no aparecen datos:
1. **Verificar que hay tareas** en Google Classroom
2. **Verificar que el estudiante** está en la clase
3. **Verificar entregas** - Al menos 1 tarea entregada
4. **Refresh** - Hacer clic en sincronizar de nuevo

### Si las células no se crean:
1. **Verificar que hay estudiantes** sincronizados
2. **Revisar logs** en consola de Vercel
3. **Explicar concepto** - Mostrar cómo funcionaría en producción

## 🎯 Mensajes Clave para Jurado

### Problema Real:
- **ONG real** con 144 jóvenes vulnerables
- **Proceso manual** de 4 horas/semana
- **Falta de seguimiento** personalizado

### Solución Técnica:
- **Integración directa** con Google Classroom API
- **Dashboard en tiempo real** con métricas automáticas
- **Sistema de células** para seguimiento personalizado
- **Arquitectura escalable** y moderna

### Impacto Social:
- **Eficiencia operativa** - 94% reducción de tiempo
- **Mejor seguimiento** - Alertas automáticas
- **Personalización** - 8 células especializadas
- **Escalabilidad** - Listo para más cohortes

### Diferenciadores:
- **Datos reales** - No es solo mockup
- **Integración completa** - API de Google Classroom
- **Modo híbrido** - Demo y producción
- **Impacto medible** - Métricas concretas

## ✅ Resultado Esperado

Al final de la demo, el jurado debe ver:
- ✅ **Problema real** claramente definido
- ✅ **Solución técnica** funcionando
- ✅ **Integración real** con Google Classroom
- ✅ **Impacto social** cuantificado
- ✅ **Escalabilidad** demostrada

---

**¡Con esta configuración tienes una demo sólida que muestra valor real en menos de 5 minutos!**
