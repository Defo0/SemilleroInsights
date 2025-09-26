# 🔐 Configuración OAuth para Google Classroom

## 📋 Checklist de Configuración

### 1. Google Cloud Console
- [ ] Proyecto creado: "Semillero Insights"
- [ ] Google Classroom API habilitada
- [ ] OAuth 2.0 Client ID creado
- [ ] Orígenes autorizados configurados
- [ ] URIs de redirección configurados

### 2. Variables de Entorno en Vercel
- [ ] `VITE_GOOGLE_CLIENT_ID` configurada
- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada

## 🚀 Pasos Detallados

### Paso 1: Google Cloud Console

1. **Ir a Google Cloud Console**
   - URL: https://console.cloud.google.com
   - Crear proyecto: "Semillero Insights"

2. **Habilitar APIs**
   ```
   APIs y servicios → Biblioteca
   Buscar: "Google Classroom API"
   Hacer clic: "Habilitar"
   ```

3. **Crear Credenciales OAuth**
   ```
   APIs y servicios → Credenciales
   Crear credenciales → ID de cliente OAuth 2.0
   Tipo: Aplicación web
   Nombre: "Semillero Insights Web Client"
   ```

4. **Configurar URLs**
   ```
   Orígenes JavaScript autorizados:
   - http://localhost:5173
   - https://semillero-insights.vercel.app
   
   URIs de redirección autorizados:
   - http://localhost:5173
   - https://semillero-insights.vercel.app
   ```

5. **Copiar Client ID**
   - Formato: `123456789-abcdefg.apps.googleusercontent.com`

### Paso 2: Configurar Vercel

1. **Ir a Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Proyecto: semillero-insights

2. **Configurar Variables de Entorno**
   ```
   Settings → Environment Variables
   
   Agregar:
   VITE_GOOGLE_CLIENT_ID = tu_client_id_aqui
   ```

3. **Verificar Variables Existentes**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Redesplegar**
   ```
   Deployments → Redeploy
   ```

### Paso 3: Probar Conexión

1. **Abrir Aplicación**
   - URL: https://semillero-insights.vercel.app

2. **Hacer Login**
   - Usar cuenta que tiene acceso a Google Classroom
   - Aceptar permisos de Classroom

3. **Cambiar a Modo Real**
   - Toggle: "Usar Datos Reales"

4. **Sincronizar**
   - Botón: "Sincronizar con Classroom"
   - Verificar estado en tiempo real

## 🧪 Debugging

### Si el login falla:
1. **Verificar Client ID** en variables de entorno
2. **Verificar URLs** en Google Cloud Console
3. **Limpiar cache** del navegador
4. **Revisar consola** de DevTools

### Si la sincronización falla:
1. **Verificar permisos** de Classroom
2. **Verificar que tienes clases** como profesor/admin
3. **Revisar logs** en Vercel Functions
4. **Verificar Supabase** connection

### Comandos de Debug:
```javascript
// En consola del navegador:
console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
```

## ✅ Verificación Final

### Datos que deberían aparecer después de sincronizar:
- **Cursos:** 1 (tu clase de demo)
- **Estudiantes:** 1 (tu cuenta de estudiante)
- **Tareas:** 3-4 (las que creaste)
- **Entregas:** 1-2 (las que simulaste)

### En el Dashboard:
- **Total Estudiantes:** 1
- **Cursos Activos:** 1
- **Tareas Totales:** 3-4
- **Tasa de Completitud:** 25-50%

## 🚨 Problemas Comunes

### Error: "Invalid Client ID"
- Verificar que el Client ID esté bien copiado
- Verificar que no tenga espacios extra
- Redesplegar en Vercel

### Error: "Unauthorized"
- Verificar URLs en Google Cloud Console
- Verificar que coincidan exactamente
- Verificar protocolo (http vs https)

### Error: "No courses found"
- Verificar que seas profesor/admin de la clase
- Verificar que la clase esté activa
- Verificar permisos de Classroom API

---

**¡Una vez configurado esto, tu clase real se conectará automáticamente al dashboard!**
