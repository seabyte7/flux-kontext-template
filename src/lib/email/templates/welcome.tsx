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

interface WelcomeEmailProps {
  name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Flux Kontext - Start creating amazing AI images!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Flux Kontext!</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thanks for joining Flux Kontext! We're excited to have you on board.
            You've received <strong>100 free credits</strong> to get started with
            AI-powered image generation.
          </Text>
          <Section style={buttonSection}>
            <Link style={button} href="https://fluxkontext.space/generate">
              Start Creating
            </Link>
          </Section>
          <Text style={text}>Here's what you can do with Flux Kontext:</Text>
          <Text style={listItem}>Generate stunning AI images from text prompts</Text>
          <Text style={listItem}>Edit and transform existing images with AI</Text>
          <Text style={listItem}>Create professional-quality visuals in seconds</Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you have any questions, feel free to reach out to our support team.
          </Text>
          <Text style={footer}>
            &copy; {new Date().getFullYear()} Flux Kontext. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

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

const listItem: React.CSSProperties = {
  color: '#d4d4d4',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
  paddingLeft: '16px',
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
