import { Resend } from 'resend'
import { WelcomeEmail } from './templates/welcome'
import { PaymentReceiptEmail } from './templates/payment-receipt'
import { CreditsLowEmail } from './templates/credits-low'
import { env } from '@/lib/env'

const resend = new Resend(env.RESEND_API_KEY)

const EMAIL_FROM = env.EMAIL_FROM || 'Flux Kontext <noreply@fluxkontext.space>'

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

// 发送欢迎邮件
export async function sendWelcomeEmail(params: {
  to: string
  name: string
}): Promise<SendEmailResult> {
  try {
    if (!env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping welcome email')
      return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: 'Welcome to Flux Kontext! 🎨',
      react: WelcomeEmail({ name: params.name }),
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error: error.message }
    }

    console.log(`Welcome email sent to ${params.to}, id: ${data?.id}`)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Error sending welcome email:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// 发送支付回执邮件
export async function sendPaymentReceiptEmail(params: {
  to: string
  name: string
  amount: number
  currency: string
  credits: number
  orderNumber: string
  paidAt: string
}): Promise<SendEmailResult> {
  try {
    if (!env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping payment receipt email')
      return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: `Payment Confirmed - Order #${params.orderNumber}`,
      react: PaymentReceiptEmail({
        name: params.name,
        amount: params.amount,
        currency: params.currency,
        credits: params.credits,
        orderNumber: params.orderNumber,
        paidAt: params.paidAt,
      }),
    })

    if (error) {
      console.error('Failed to send payment receipt email:', error)
      return { success: false, error: error.message }
    }

    console.log(`Payment receipt email sent to ${params.to}, id: ${data?.id}`)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Error sending payment receipt email:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// 发送积分不足提醒邮件
export async function sendCreditsLowEmail(params: {
  to: string
  name: string
  remainingCredits: number
}): Promise<SendEmailResult> {
  try {
    if (!env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping credits low email')
      return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: 'Your Flux Kontext Credits Are Running Low',
      react: CreditsLowEmail({
        name: params.name,
        remainingCredits: params.remainingCredits,
      }),
    })

    if (error) {
      console.error('Failed to send credits low email:', error)
      return { success: false, error: error.message }
    }

    console.log(`Credits low email sent to ${params.to}, id: ${data?.id}`)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Error sending credits low email:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
