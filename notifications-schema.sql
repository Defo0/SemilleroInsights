-- Esquema adicional para sistema de notificaciones

-- Tabla de notificaciones
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new_submission', 'assignment_due', 'grade_assigned', 'announcement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipients UUID[] NOT NULL,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de preferencias de notificación de usuarios
CREATE TABLE public.user_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  discord_enabled BOOLEAN DEFAULT false,
  telegram_enabled BOOLEAN DEFAULT false,
  discord_id TEXT,
  telegram_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de webhooks y configuraciones
CREATE TABLE public.notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuraciones por defecto
INSERT INTO public.notification_settings (setting_key, setting_value, description) VALUES
  ('discord_webhook_general', '', 'Webhook de Discord para notificaciones generales'),
  ('discord_webhook_coordinators', '', 'Webhook de Discord para coordinadores'),
  ('discord_webhook_professors', '', 'Webhook de Discord para profesores'),
  ('telegram_bot_token', '', 'Token del bot de Telegram'),
  ('resend_api_key', '', 'API Key de Resend para emails'),
  ('notifications_enabled', 'true', 'Habilitar/deshabilitar notificaciones globalmente');

-- Índices para performance
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_sent_at ON public.notifications(sent_at);
CREATE INDEX idx_user_notification_preferences_user_id ON public.user_notification_preferences(user_id);

-- Políticas RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias preferencias
CREATE POLICY "Users can view own notification preferences" ON public.user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON public.user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON public.user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los coordinadores pueden ver todas las notificaciones
CREATE POLICY "Coordinators can view all notifications" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Los profesores pueden ver notificaciones dirigidas a ellos
CREATE POLICY "Professors can view their notifications" ON public.notifications
  FOR SELECT USING (
    auth.uid() = ANY(recipients) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Solo coordinadores pueden ver configuraciones
CREATE POLICY "Only coordinators can view notification settings" ON public.notification_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Función para enviar notificación automática cuando hay nueva entrega
CREATE OR REPLACE FUNCTION notify_new_submission()
RETURNS TRIGGER AS $$
DECLARE
  assignment_info RECORD;
  student_info RECORD;
  professor_ids UUID[];
BEGIN
  -- Solo procesar entregas nuevas
  IF NEW.status = 'turned_in' AND (OLD.status IS NULL OR OLD.status != 'turned_in') THEN
    
    -- Obtener información de la tarea y estudiante
    SELECT a.title, a.due_date, c.name as course_name, st.name as student_name, st.email as student_email
    INTO assignment_info
    FROM public.assignments a
    JOIN public.courses c ON c.id = a.course_id
    JOIN public.students st ON st.id = NEW.student_id
    WHERE a.id = NEW.assignment_id;
    
    -- Obtener profesores de la célula del estudiante
    SELECT ARRAY_AGG(pc.professor_id)
    INTO professor_ids
    FROM public.student_cells sc
    JOIN public.professor_cells pc ON pc.cell_id = sc.cell_id
    WHERE sc.student_id = NEW.student_id;
    
    -- Insertar notificación
    INSERT INTO public.notifications (
      type,
      title,
      message,
      recipients,
      metadata
    ) VALUES (
      'new_submission',
      'Nueva Entrega Recibida',
      format('El estudiante %s ha entregado la tarea "%s" del curso %s', 
             assignment_info.student_name, 
             assignment_info.title, 
             assignment_info.course_name),
      professor_ids,
      jsonb_build_object(
        'assignment_id', NEW.assignment_id,
        'student_id', NEW.student_id,
        'assignment_title', assignment_info.title,
        'student_name', assignment_info.student_name,
        'course_name', assignment_info.course_name
      )
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificaciones automáticas
CREATE TRIGGER trigger_notify_new_submission
  AFTER INSERT OR UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_submission();

-- Función para obtener notificaciones de un usuario
CREATE OR REPLACE FUNCTION get_user_notifications(user_id_param UUID, limit_param INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.metadata,
    n.sent_at,
    false as is_read -- Por ahora, todas las notificaciones se consideran no leídas
  FROM public.notifications n
  WHERE user_id_param = ANY(n.recipients)
  ORDER BY n.sent_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_notification_preferences_updated_at 
  BEFORE UPDATE ON public.user_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at 
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
