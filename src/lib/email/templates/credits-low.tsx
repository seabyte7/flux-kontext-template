import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface CreditsLowEmailProps {
  name: string
  remainingCredits: number
}

export function CreditsLowEmail({ name, remainingCredits }: CreditsLowEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Flux Kontext credits are running low - {remainingCredits} remaining</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Credits Running Low</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Your Flux Kontext account has only <strong>{remainingCredits} credits</strong> remaining.
            Top up now to keep creating amazing AI images without interruption.
          </Text>
          <Section style={creditBox}>
            <Text style={creditNumber}>{remainingCredits}</Text>
            <Text style={creditLabel}>Credits Remaining</Text>
          </Section>
          <Section style={buttonSection}>
            <Link style={button} href="https://fluxkontext.space/pricing">
              Get More Credits
            </Link>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            You're receiving this email because your credit balance is low.
          </Text>
          <Text style={footer}>
            &copy; {new Date().getFullYear()} Flux Kontext. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default CreditsLowEmail

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

const creditBox: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '32px',
  margin: '24px 0',
  textAlign: 'center' as const,
  border: '1px solid #f59e0b',
}

const creditNumber: React.CSSProperties = {
  color: '#f59e0b',
  fontSize: '48px',
  fontWeight: '700',
  margin: '0',
  lineHeight: '1',
}

const creditLabel: React.CSSProperties = {
  color: '#999999',
  fontSize: '14px',
  margin: '8px 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const buttonSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button: React.CSSProperties = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 32px',
  textDecoration: 'none',
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
