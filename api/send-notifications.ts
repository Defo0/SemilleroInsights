import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface NotificationData {
  type: 'new_submission' | 'assignment_due' | 'grade_assigned' | 'announcement'
  title: string
  message: string
  recipients: {
    userId: string
    email: string
    name: string
    role: 'coordinator' | 'professor' | 'student'
    preferences?: {
      email?: boolean
      discord?: boolean
      telegram?: boolean
      discordId?: string
      telegramId?: string
    }
  }[]
  metadata?: {
    assignmentId?: string
    courseId?: string
    cellId?: string
    studentId?: string
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const notificationData: NotificationData = req.body

    const results = await Promise.allSettled([
      sendEmailNotifications(notificationData),
      sendDiscordNotifications(notificationData),
      sendTelegramNotifications(notificationData)
    ])

    // Guardar notificación en la base de datos
    await saveNotificationToDatabase(notificationData)

    const emailResult = results[0]
    const discordResult = results[1]
    const telegramResult = results[2]

    res.status(200).json({
      message: 'Notifications sent',
      results: {
        email: emailResult.status === 'fulfilled' ? 'success' : 'failed',
        discord: discordResult.status === 'fulfilled' ? 'success' : 'failed',
        telegram: telegramResult.status === 'fulfilled' ? 'success' : 'failed'
      },
      errors: [
        emailResult.status === 'rejected' ? emailResult.reason : null,
        discordResult.status === 'rejected' ? discordResult.reason : null,
        telegramResult.status === 'rejected' ? telegramResult.reason : null
      ].filter(Boolean)
    })

  } catch (error) {
    console.error('Notification error:', error)
    res.status(500).json({ 
      error: 'Failed to send notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function sendEmailNotifications(data: NotificationData) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const emailRecipients = data.recipients.filter(r => r.preferences?.email !== false)
  
  if (emailRecipients.length === 0) return

  const emailData = {
    from: 'Semillero Insights <notifications@semilleroinsights.com>',
    to: emailRecipients.map(r => r.email),
    subject: data.title,
    html: generateEmailHTML(data)
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  })

  if (!response.ok) {
    throw new Error(`Email API error: ${response.statusText}`)
  }

  return await response.json()
}

async function sendDiscordNotifications(data: NotificationData) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    throw new Error('DISCORD_WEBHOOK_URL not configured')
  }

  const discordRecipients = data.recipients.filter(r => r.preferences?.discord === true)
  
  if (discordRecipients.length === 0) return

  const embed = {
    title: data.title,
    description: data.message,
    color: 0x5a25ab, // Color primario de Semillero
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Semillero Digital - Insights Dashboard',
      icon_url: 'https://semilleroinsights.vercel.app/logo.png'
    },
    fields: [
      {
        name: '👥 Destinatarios',
        value: discordRecipients.map(r => `• ${r.name} (${r.role})`).join('\n'),
        inline: false
      }
    ]
  }

  const discordData = {
    embeds: [embed],
    content: discordRecipients.map(r => r.preferences?.discordId ? `<@${r.preferences.discordId}>` : '').filter(Boolean).join(' ')
  }

  const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(discordData)
  })

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.statusText}`)
  }

  return { success: true }
}

async function sendTelegramNotifications(data: NotificationData) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured')
  }

  const telegramRecipients = data.recipients.filter(r => r.preferences?.telegram === true && r.preferences?.telegramId)
  
  if (telegramRecipients.length === 0) return

  const message = `
🔔 *${data.title}*

${data.message}

📊 _Semillero Digital - Insights Dashboard_
  `

  const promises = telegramRecipients.map(async (recipient) => {
    const telegramData = {
      chat_id: recipient.preferences!.telegramId,
      text: message,
      parse_mode: 'Markdown'
    }

    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(telegramData)
    })

    if (!response.ok) {
      throw new Error(`Telegram API error for ${recipient.name}: ${response.statusText}`)
    }

    return await response.json()
  })

  return await Promise.all(promises)
}

function generateEmailHTML(data: NotificationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    body { font-family: 'Raleway', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #5a25ab 0%, #af77f4 100%); padding: 30px; text-align: center; }
    .logo { color: white; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .header-subtitle { color: rgba(255,255,255,0.9); font-size: 14px; }
    .content { padding: 30px; }
    .title { color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 20px; }
    .message { color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background-color: #fabb2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: 500; }
    .footer { background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📊 Semillero Insights</div>
      <div class="header-subtitle">Dashboard Inteligente para Google Classroom</div>
    </div>
    <div class="content">
      <h1 class="title">${data.title}</h1>
      <div class="message">${data.message}</div>
      <a href="https://semilleroinsights.vercel.app" class="button">Ver Dashboard</a>
    </div>
    <div class="footer">
      <p>Este mensaje fue enviado por Semillero Digital</p>
      <p>Si no deseas recibir estas notificaciones, puedes configurar tus preferencias en el dashboard.</p>
    </div>
  </div>
</body>
</html>
  `
}

async function saveNotificationToDatabase(data: NotificationData) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      type: data.type,
      title: data.title,
      message: data.message,
      recipients: data.recipients.map(r => r.userId),
      metadata: data.metadata,
      sent_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error saving notification to database:', error)
  }
}
