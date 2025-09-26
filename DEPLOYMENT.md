# 🚀 Guía de Despliegue - Semillero Insights

## 📋 Checklist Pre-Despliegue

### ✅ **1. Configuración de Supabase**
- [ ] Proyecto creado en [supabase.com](https://supabase.com)
- [ ] Ejecutar `supabase-schema.sql` en SQL Editor
- [ ] Ejecutar `notifications-schema.sql` en SQL Editor
- [ ] Ejecutar `sample-data.sql` para datos de prueba
- [ ] Configurar Google OAuth en Authentication > Settings
- [ ] Anotar URL del proyecto y claves

### ✅ **2. Configuración de Google Cloud Console**
- [ ] Proyecto creado en [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Google Classroom API habilitada
- [ ] Credenciales OAuth 2.0 creadas
- [ ] Dominios autorizados configurados
- [ ] Scopes configurados correctamente

### ✅ **3. Servicios de Notificación**
- [ ] Cuenta en [resend.com](https://resend.com) y API key obtenida
- [ ] Webhook de Discord configurado (opcional)
- [ ] Bot de Telegram creado con @BotFather (opcional)

---

## 🌐 **Despliegue en Vercel**

### **Paso 1: Preparar el Repositorio**
```bash
# Asegúrate de que todos los archivos estén committeados
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **Paso 2: Conectar con Vercel**
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Selecciona el proyecto `SemilleroInsights`

### **Paso 3: Configurar Variables de Entorno**
En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu-clave-anonima
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu-service-role-key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# Notificaciones (Opcionales)
RESEND_API_KEY=re_...tu-api-key
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TELEGRAM_BOT_TOKEN=123456789:ABC...

# App URL
VITE_APP_URL=https://tu-app.vercel.app
```

### **Paso 4: Desplegar**
```bash
# Opción 1: Desde Vercel Dashboard
# Hacer clic en "Deploy" en el dashboard

# Opción 2: Desde CLI
npm i -g vercel
vercel --prod
```

---

## 🔧 **Configuración Post-Despliegue**

### **1. Actualizar URLs en Google Cloud Console**
- Agregar tu dominio de Vercel a "Authorized JavaScript origins"
- Agregar `https://tu-app.vercel.app` a "Authorized redirect URIs"

### **2. Actualizar URLs en Supabase**
- Site URL: `https://tu-app.vercel.app`
- Redirect URLs: `https://tu-app.vercel.app/**`

### **3. Configurar Webhooks de Discord**
Si usas Discord, crea un webhook en tu servidor:
1. Ve a Configuración del Servidor > Integraciones > Webhooks
2. Crear Webhook
3. Copiar URL y agregar a variables de entorno

### **4. Configurar Bot de Telegram**
Si usas Telegram:
1. Habla con @BotFather en Telegram
2. Crear nuevo bot con `/newbot`
3. Copiar token y agregar a variables de entorno

---

## 🧪 **Testing Post-Despliegue**

### **Checklist de Funcionalidad**
- [ ] Login con Google funciona
- [ ] Dashboard del Coordinador carga correctamente
- [ ] Dashboard del Profesor funciona
- [ ] Sincronización con Classroom funciona
- [ ] Notificaciones por email funcionan
- [ ] Notificaciones por Discord funcionan (si configurado)
- [ ] Notificaciones por Telegram funcionan (si configurado)
- [ ] Responsive design funciona en móvil

### **URLs de Prueba**
- **App Principal**: `https://tu-app.vercel.app`
- **API Sync**: `https://tu-app.vercel.app/api/sync-classroom`
- **API Notifications**: `https://tu-app.vercel.app/api/send-notifications`

---

## 🚨 **Solución de Problemas Comunes**

### **Error: "Supabase connection failed"**
- ✅ Verificar que las variables de entorno estén correctas
- ✅ Verificar que el proyecto de Supabase esté activo
- ✅ Verificar que las políticas RLS estén configuradas

### **Error: "Google OAuth failed"**
- ✅ Verificar que el Client ID sea correcto
- ✅ Verificar que los dominios estén autorizados
- ✅ Verificar que los scopes estén configurados

### **Error: "Classroom API access denied"**
- ✅ Verificar que la API esté habilitada
- ✅ Verificar que los scopes incluyan Classroom
- ✅ Verificar que el usuario tenga acceso a Classroom

### **Error: "Notifications not working"**
- ✅ Verificar las API keys de los servicios
- ✅ Verificar que las URLs de webhook sean correctas
- ✅ Verificar los logs en Vercel Functions

---

## 📊 **Monitoreo y Analytics**

### **Vercel Analytics**
- Habilitar Vercel Analytics en el dashboard
- Monitorear performance y errores

### **Supabase Monitoring**
- Revisar logs en Supabase Dashboard
- Monitorear uso de la base de datos

### **Error Tracking**
```javascript
// Agregar a tu código para tracking de errores
console.error('Error details:', error)
```

---

## 🔄 **Actualizaciones Futuras**

### **Proceso de Actualización**
1. Hacer cambios en desarrollo
2. Probar localmente
3. Commit y push a GitHub
4. Vercel desplegará automáticamente

### **Rollback en Caso de Problemas**
1. Ve a Vercel Dashboard
2. Deployments
3. Selecciona una versión anterior
4. Hacer clic en "Promote to Production"

---

## 📞 **Soporte**

Si encuentras problemas durante el despliegue:

1. **Revisar logs**: Vercel Functions > View Function Logs
2. **Revisar variables**: Settings > Environment Variables
3. **Probar APIs**: Usar herramientas como Postman
4. **Documentación**: Consultar docs de Vercel, Supabase, etc.

---

## 🎉 **¡Listo para el Hackathon!**

Una vez completados todos los pasos, tu aplicación estará lista para impresionar a los jueces con:

- ✨ **Interfaz moderna y responsive**
- 🚀 **Funcionalidad completa**
- 🔔 **Sistema de notificaciones multi-canal**
- 📊 **Dashboards interactivos**
- 🎯 **Impacto social demostrable**

**¡Buena suerte en el hackathon! 🏆**
