import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface PaymentReceiptEmailProps {
  name: string
  amount: number
  currency: string
  credits: number
  orderNumber: string
  paidAt: string
}

export function PaymentReceiptEmail({
  name,
  amount,
  currency,
  credits,
  orderNumber,
  paidAt,
}: PaymentReceiptEmailProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)

  return (
    <Html>
      <Head />
      <Preview>Payment confirmed - {formattedAmount} for {credits} credits</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Confirmed</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Your payment has been successfully processed. Here are the details:
          </Text>
          <Section style={receiptBox}>
            <Text style={receiptRow}>
              <span style={receiptLabel}>Order Number</span>
              <span style={receiptValue}>#{orderNumber}</span>
            </Text>
            <Hr style={receiptDivider} />
            <Text style={receiptRow}>
              <span style={receiptLabel}>Amount</span>
              <span style={receiptValue}>{formattedAmount}</span>
            </Text>
            <Hr style={receiptDivider} />
            <Text style={receiptRow}>
              <span style={receiptLabel}>Credits Added</span>
              <span style={receiptValue}>{credits} credits</span>
            </Text>
            <Hr style={receiptDivider} />
            <Text style={receiptRow}>
              <span style={receiptLabel}>Date</span>
              <span style={receiptValue}>{new Date(paidAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
            </Text>
          </Section>
          <Text style={text}>
            Your credits have been added to your account and are ready to use.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you have any questions about this transaction, please contact our support team.
          </Text>
          <Text style={footer}>
            &copy; {new Date().getFullYear()} Flux Kontext. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default PaymentReceiptEmail

const main: React.CSSProperties = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
}

const h1: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const text: React.CSSProperties = {
  color: '#d4d4d4',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const receiptBox: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #333333',
}

const receiptRow: React.CSSProperties = {
  color: '#d4d4d4',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
}

const receiptLabel: React.CSSProperties = {
  color: '#999999',
}

const receiptValue: React.CSSProperties = {
  color: '#ffffff',
  fontWeight: '600',
}

const receiptDivider: React.CSSProperties = {
  borderColor: '#2a2a2a',
  margin: '12px 0',
}

const hr: React.CSSProperties = {
  borderColor: '#333333',
  margin: '32px 0',
}

const footer: React.CSSProperties = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}
