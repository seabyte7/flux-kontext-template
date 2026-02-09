import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  sendWelcomeEmail,
  sendPaymentReceiptEmail,
  sendCreditsLowEmail,
} from '@/lib/email'

// 内部邮件发送 API（需要认证）
export async function POST(request: NextRequest) {
  try {
    // 验证内部调用：检查 API 密钥或用户 session
    const apiKey = request.headers.get('x-api-key')
    const isInternalCall = apiKey === process.env.RESEND_API_KEY

    if (!isInternalCall) {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { type, ...params } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Email type is required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'welcome':
        if (!params.to || !params.name) {
          return NextResponse.json(
            { error: 'Missing required fields: to, name' },
            { status: 400 }
          )
        }
        result = await sendWelcomeEmail({ to: params.to, name: params.name })
        break

      case 'payment-receipt':
        if (!params.to || !params.name || !params.amount || !params.currency || !params.credits || !params.orderNumber || !params.paidAt) {
          return NextResponse.json(
            { error: 'Missing required fields for payment receipt' },
            { status: 400 }
          )
        }
        result = await sendPaymentReceiptEmail(params)
        break

      case 'credits-low':
        if (!params.to || !params.name || params.remainingCredits === undefined) {
          return NextResponse.json(
            { error: 'Missing required fields: to, name, remainingCredits' },
            { status: 400 }
          )
        }
        result = await sendCreditsLowEmail(params)
        break

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
