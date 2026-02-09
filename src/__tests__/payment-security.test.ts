import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest'

// Mock database module to avoid Supabase transitive dependency issues
vi.mock('@/lib/database', () => ({
  prisma: {},
}))

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(),
}))

import {
  STANDARD_PRICING,
  CREEM_TO_INTERNAL_MAPPING,
  mapCreemProductIdToInternal,
  generateValidationHash,
  verifyValidationHash,
  getProductInfo,
} from '@/lib/payment-security'

const originalPaymentSecret = process.env.PAYMENT_VALIDATION_SECRET

describe('payment-security', () => {
  beforeAll(() => {
    process.env.PAYMENT_VALIDATION_SECRET = 'test_payment_validation_secret_32_chars'
  })

  afterAll(() => {
    if (originalPaymentSecret === undefined) {
      delete process.env.PAYMENT_VALIDATION_SECRET
      return
    }

    process.env.PAYMENT_VALIDATION_SECRET = originalPaymentSecret
  })

  describe('STANDARD_PRICING', () => {
    it('should have correct subscription plans', () => {
      expect(STANDARD_PRICING.subscriptions).toHaveProperty('basic')
      expect(STANDARD_PRICING.subscriptions).toHaveProperty('plus')
      expect(STANDARD_PRICING.subscriptions).toHaveProperty('pro')
    })

    it('should have correct basic plan prices', () => {
      expect(STANDARD_PRICING.subscriptions.basic.monthly.price).toBe(0)
      expect(STANDARD_PRICING.subscriptions.basic.yearly.price).toBe(0)
    })

    it('should have correct credit pack prices', () => {
      expect(STANDARD_PRICING.creditPacks.starter.price).toBe(4.90)
      expect(STANDARD_PRICING.creditPacks.starter.credits).toBe(600)
      expect(STANDARD_PRICING.creditPacks.creator.price).toBe(15.00)
      expect(STANDARD_PRICING.creditPacks.business.price).toBe(60.00)
    })
  })

  describe('mapCreemProductIdToInternal', () => {
    it('should map CREEM subscription IDs to internal IDs', () => {
      const result = mapCreemProductIdToInternal('subscription', 'FluxKontext-Plus-Monthly')
      expect(result.internalProductId).toBe('plus')
      expect(result.internalBillingCycle).toBe('monthly')
    })

    it('should map CREEM yearly subscription IDs', () => {
      const result = mapCreemProductIdToInternal('subscription', 'FluxKontext-Pro-Yearly')
      expect(result.internalProductId).toBe('pro')
      expect(result.internalBillingCycle).toBe('yearly')
    })

    it('should fallback to original ID for unknown subscription', () => {
      const result = mapCreemProductIdToInternal('subscription', 'unknown-plan', 'monthly')
      expect(result.internalProductId).toBe('unknown-plan')
      expect(result.internalBillingCycle).toBe('monthly')
    })

    it('should map CREEM credit pack IDs to internal IDs', () => {
      const result = mapCreemProductIdToInternal('creditPack', 'Starter Pack')
      expect(result.internalProductId).toBe('starter')
    })

    it('should fallback to original ID for unknown credit pack', () => {
      const result = mapCreemProductIdToInternal('creditPack', 'unknown-pack')
      expect(result.internalProductId).toBe('unknown-pack')
    })

    it('should return original ID for unknown product type', () => {
      const result = mapCreemProductIdToInternal('other' as any, 'some-id')
      expect(result.internalProductId).toBe('some-id')
    })
  })

  describe('generateValidationHash / verifyValidationHash', () => {
    it('should generate consistent hashes for same data', () => {
      const data = { userId: 'user1', amount: 100 }
      const hash1 = generateValidationHash(data)
      const hash2 = generateValidationHash(data)
      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different data', () => {
      const hash1 = generateValidationHash({ userId: 'user1', amount: 100 })
      const hash2 = generateValidationHash({ userId: 'user2', amount: 100 })
      expect(hash1).not.toBe(hash2)
    })

    it('should verify valid hash correctly', () => {
      const data = { userId: 'user1', amount: 100 }
      const hash = generateValidationHash(data)
      expect(verifyValidationHash(data, hash)).toBe(true)
    })

    it('should reject invalid hash', () => {
      const data = { userId: 'user1', amount: 100 }
      expect(() => verifyValidationHash(data, 'invalid-hash')).toThrow()
    })
  })

  describe('getProductInfo', () => {
    it('should return subscription plan info', () => {
      const info = getProductInfo('subscription', 'plus', 'monthly')
      expect(info).not.toBeNull()
      expect(info!.price).toBe(9.90)
      expect(info!.credits).toBe(1900)
    })

    it('should return credit pack info', () => {
      const info = getProductInfo('creditPack', 'creator')
      expect(info).not.toBeNull()
      expect(info!.price).toBe(15.00)
      expect(info!.credits).toBe(4000)
    })

    it('should return null for unknown subscription', () => {
      const info = getProductInfo('subscription', 'nonexistent', 'monthly')
      expect(info).toBeNull()
    })

    it('should return null for unknown credit pack', () => {
      const info = getProductInfo('creditPack', 'nonexistent')
      expect(info).toBeUndefined()
    })

    it('should return undefined for missing billing cycle', () => {
      const info = getProductInfo('subscription', 'plus')
      expect(info).toBeNull()
    })
  })
})
