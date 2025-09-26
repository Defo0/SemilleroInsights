. Visión General y Contexto
Semillero Digital es una ONG que capacita a jóvenes en situación de vulnerabilidad económica en habilidades digitales para mejorar su empleabilidad. Su plataforma educativa principal es Google Classroom, donde gestionan cursos, alumnos, profesores y tareas.
2. El Problema Central (Detectado en los Videos y Transcripciones)
Aunque Google Classroom es funcional, su uso a gran escala ha generado tres problemas críticos que impiden la eficiencia y el seguimiento adecuado:
Ineficiencia y Trabajo Manual Excesivo:
Contexto: El equipo de coordinación invierte una gran cantidad de tiempo en revisar manualmente las entregas de cada alumno dentro de Classroom para luego consolidar esos datos y construir tableros de métricas (como el que se muestra en el primer video).
Impacto: Este proceso es lento, propenso a errores y no ofrece una visión en tiempo real del progreso académico.
Falta de Segmentación y Vistas Personalizadas:
Contexto: Classroom no permite agrupar alumnos en "células" (grupos de ~8 alumnos) y asignarlos a un profesor específico dentro de la misma clase. Un profesor ve a los 144 alumnos, lo que le dificulta hacer un seguimiento enfocado en su grupo.
Impacto: Los profesores no pueden ver de un vistazo el estado de sus alumnos, lo que complica la corrección y el apoyo personalizado.
Comunicación Fragmentada y Métricas Opacas:
Contexto: Las notificaciones importantes se pueden perder en el flujo de Classroom. Obtener datos clave como el porcentaje de entregas a tiempo, la participación o las calificaciones requiere una extracción manual tarea por tarea y alumno por alumno.
Impacto: La gestión se vuelve reactiva en lugar de proactiva, y es difícil identificar rápidamente a los alumnos que necesitan ayuda.
3. El Objetivo Principal: La Solución
Construir una aplicación web tipo dashboard que actúe como una capa de visualización y gestión inteligente por encima de Google Classroom.
El objetivo no es reemplazar Classroom, sino complementarlo para:
Automatizar la recolección y visualización de métricas.
Ofrecer vistas personalizadas por rol (Coordinador y Profesor).
Centralizar el seguimiento del progreso de los estudiantes de manera ágil y visual.
4. Arquitectura y Stack Tecnológico
Frontend: React con TypeScript (desplegado en Vercel).
Backend: Funciones Serverless de Node.js (desplegadas en Vercel).
Base de Datos y Autenticación: Supabase (usando PostgreSQL y su sistema de Auth con "Login with Google").
Control de Versiones: GitHub.
5. Plan de Acción: Tareas para un MVP Funcional
El plan está dividido en tareas secuenciales para ser ejecutadas por un agente de programación o un desarrollador.
Tarea 0: Preparación:
Configurar repositorios y proyectos en GitHub, Vercel y Supabase.
Activar la API de Google Classroom y obtener credenciales OAuth 2.0.
Crear el archivo AGENTS.md con las instrucciones.
Tarea 1: Base del Proyecto Frontend:
Crear la aplicación React con Vite y TypeScript.
Instalar y configurar dependencias clave: TailwindCSS, Supabase-js, etc.
Tarea 2: Autenticación de Usuarios:
Implementar el "Login with Google" a través de Supabase, solicitando los permisos necesarios para acceder a los datos de Classroom.
Tarea 3: Backend - Sincronización de Datos:
Crear una función serverless que use el token del usuario para obtener cursos, alumnos, tareas y estados de entrega desde la API de Google Classroom y los guarde en Supabase.
Tarea 4: Modelo de Datos de Células:
Crear las tablas en Supabase (cells, professors_cells, students_cells) para establecer la relación Profesor -> Célula -> Alumno que Classroom no tiene.
Realizar una carga manual inicial de estos datos para la hackathon.
Tarea 5: Frontend - Dashboard del Coordinador:
Crear la vista principal que replique las métricas globales del primer video (gráficos de entregas totales, por tarea y por célula), obteniendo los datos desde Supabase.
Tarea 6: Frontend - Dashboard del Profesor y Roles:
Implementar un sistema de roles.
Crear una vista filtrada donde los profesores vean únicamente los datos y el progreso de los alumnos asignados a su célula.
Tarea 7: Backend - Notificaciones (MVP):
Integrar un servicio de email (ej. Resend) para enviar notificaciones automáticas a los profesores cuando un alumno de su célula entregue una tarea.
6. Guía de Diseño y Estilo
Fuente: Raleway, sans-serif.
Colores:
Fondo: Blanco.
Primario/Footer: #5a25ab
Botones/Resaltados: #fabb2f
Acentos gráficos: #50c69a, #fa8534, #ed3f70, #2ec69d.
Colores claros complementarios: #af77f4, #fe7ea1, #fcaf79.
Formas: Predominantemente suaves y redondeadas (rectángulos con bordes redondeados, círculos, elipses). Colores planos, sin degradados.