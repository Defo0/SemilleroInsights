# Guía de Configuración - Semillero Insights

## 🚀 Configuración Inicial

### 1. Configuración de Supabase

1. **Crear proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Anota la URL del proyecto y la clave anónima

2. **Configurar base de datos**
   - Ve al SQL Editor en Supabase
   - Ejecuta el contenido de `supabase-schema.sql`
   - Ejecuta el contenido de `sample-data.sql` para datos de prueba

3. **Configurar autenticación con Google**
   - Ve a Authentication > Settings > Auth Providers
   - Habilita Google OAuth
   - Configura las credenciales de Google Cloud Console

### 2. Configuración de Google Cloud Console

1. **Crear proyecto en Google Cloud Console**
   - Ve a [console.cloud.google.com](https://console.cloud.google.com)
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar APIs necesarias**
   - Google Classroom API
   - Google OAuth2 API

3. **Configurar OAuth 2.0**
   - Ve a APIs & Services > Credentials
   - Crea credenciales OAuth 2.0
   - Configura los dominios autorizados
   - Anota el Client ID

4. **Configurar scopes necesarios**
   ```
   https://www.googleapis.com/auth/classroom.courses.readonly
   https://www.googleapis.com/auth/classroom.rosters.readonly
   https://www.googleapis.com/auth/classroom.coursework.students.readonly
   ```

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Supabase Configuration
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=tu_client_id_de_google

# Google Classroom API Scopes
VITE_GOOGLE_CLASSROOM_SCOPE=https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.coursework.students.readonly
```

### 4. Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Preview del build
npm run preview
```

## 🔧 Configuración de Vercel

### Variables de Entorno en Vercel

En el dashboard de Vercel, configura estas variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_CLIENT_ID`

### Configuración de Dominios

Asegúrate de agregar tu dominio de Vercel a:
- Google Cloud Console (OAuth redirect URIs)
- Supabase (Site URL y Redirect URLs)

## 📊 Configuración de Datos Iniciales

### Usuarios de Prueba

Para probar la aplicación, necesitarás:

1. **Coordinador**: Usuario con rol 'coordinator'
2. **Profesores**: Usuarios con rol 'professor' asignados a células

### Asignación de Células

Ejecuta estas consultas en Supabase para asignar profesores a células:

```sql
-- Insertar usuario coordinador (reemplaza con tu email)
INSERT INTO public.users (id, email, name, role) 
VALUES (
  'tu-user-id-de-auth-users',
  'coordinador@semillero.org',
  'Coordinador Principal',
  'coordinator'
);

-- Insertar profesores y asignar a células
INSERT INTO public.users (id, email, name, role) VALUES
  ('profesor-1-id', 'profesor1@semillero.org', 'Profesor Alpha', 'professor'),
  ('profesor-2-id', 'profesor2@semillero.org', 'Profesor Beta', 'professor');

-- Asignar profesores a células
INSERT INTO public.professor_cells (professor_id, cell_id) VALUES
  ('profesor-1-id', '550e8400-e29b-41d4-a716-446655440001'),
  ('profesor-2-id', '550e8400-e29b-41d4-a716-446655440002');
```

## 🔍 Verificación

### Checklist de Configuración

- [ ] Proyecto Supabase creado
- [ ] Esquema de base de datos ejecutado
- [ ] Datos de ejemplo cargados
- [ ] Google Cloud Console configurado
- [ ] APIs habilitadas
- [ ] OAuth 2.0 configurado
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Aplicación ejecutándose localmente

### Pruebas Básicas

1. **Login con Google**: Debe funcionar y redirigir al dashboard
2. **Dashboard**: Debe mostrar métricas con datos de ejemplo
3. **Navegación**: Sidebar debe funcionar correctamente
4. **Responsive**: Debe verse bien en móvil y desktop

## 🚨 Solución de Problemas

### Error de CORS
- Verificar dominios en Google Cloud Console
- Verificar Site URL en Supabase

### Error de Autenticación
- Verificar scopes de Google OAuth
- Verificar configuración de Supabase Auth

### Error de Base de Datos
- Verificar que RLS esté configurado correctamente
- Verificar que las políticas permitan acceso a los datos

### Error de Build
- Verificar que todas las variables de entorno estén configuradas
- Verificar que las dependencias estén instaladas correctamente
