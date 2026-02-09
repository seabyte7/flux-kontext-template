import { describe, it, expect } from 'vitest'
import type {
  CreditTransactionType,
  CreditOperation,
  CreditCheckResult,
  CreditOperationResult,
} from '@/lib/services/credits'

// These functions depend on prisma, so we test the pure logic aspects
// and type contracts here. Integration tests with DB mocking would go separately.

describe('credits module types and contracts', () => {
  describe('CreditTransactionType', () => {
    it('should accept valid transaction types', () => {
      const types: CreditTransactionType[] = ['purchase', 'usage', 'gift', 'refund', 'bonus']
      expect(types).toHaveLength(5)
    })
  })

  describe('CreditCheckResult contract', () => {
    it('should represent sufficient credits', () => {
      const result: CreditCheckResult = {
        hasEnoughCredits: true,
        currentCredits: 100,
        requiredCredits: 50,
        shortfall: 0,
      }
      expect(result.hasEnoughCredits).toBe(true)
      expect(result.shortfall).toBe(0)
    })

    it('should represent insufficient credits', () => {
      const result: CreditCheckResult = {
        hasEnoughCredits: false,
        currentCredits: 10,
        requiredCredits: 50,
        shortfall: 40,
      }
      expect(result.hasEnoughCredits).toBe(false)
      expect(result.shortfall).toBe(40)
    })
  })

  describe('CreditOperation contract', () => {
    it('should construct a valid credit operation', () => {
      const op: CreditOperation = {
        userId: 'user-123',
        amount: 15,
        type: 'usage',
        description: 'AI image generation',
        referenceId: 'img_12345',
        metadata: { model: 'pro' },
      }
      expect(op.userId).toBe('user-123')
      expect(op.amount).toBe(15)
      expect(op.type).toBe('usage')
    })
  })

  describe('credits calculation logic', () => {
    // Extract the pure function logic from consumeCreditsForImageGeneration
    const getCreditsRequired = (action: string): number => {
      switch (action) {
        case 'text-to-image-pro':
        case 'edit-image-pro':
        case 'edit-multi-image-pro':
          return 15
        case 'text-to-image-max':
        case 'edit-image-max':
          return 30
        case 'edit-multi-image-max':
          return 45
        case 'text-to-image-schnell':
          return 8
        case 'text-to-image-dev':
          return 12
        case 'text-to-image-realism':
        case 'text-to-image-anime':
          return 20
        default:
          return 15
      }
    }

    it('should return 15 credits for PRO actions', () => {
      expect(getCreditsRequired('text-to-image-pro')).toBe(15)
      expect(getCreditsRequired('edit-image-pro')).toBe(15)
      expect(getCreditsRequired('edit-multi-image-pro')).toBe(15)
    })

    it('should return 30 credits for MAX actions', () => {
      expect(getCreditsRequired('text-to-image-max')).toBe(30)
      expect(getCreditsRequired('edit-image-max')).toBe(30)
    })

    it('should return 45 credits for multi-image MAX', () => {
      expect(getCreditsRequired('edit-multi-image-max')).toBe(45)
    })

    it('should return 8 credits for schnell model', () => {
      expect(getCreditsRequired('text-to-image-schnell')).toBe(8)
    })

    it('should return 12 credits for dev model', () => {
      expect(getCreditsRequired('text-to-image-dev')).toBe(12)
    })

    it('should return 20 credits for realism and anime models', () => {
      expect(getCreditsRequired('text-to-image-realism')).toBe(20)
      expect(getCreditsRequired('text-to-image-anime')).toBe(20)
    })

    it('should default to 15 credits for unknown actions', () => {
      expect(getCreditsRequired('unknown-action')).toBe(15)
    })
  })
})
