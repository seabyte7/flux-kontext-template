import { describe, it, expect } from 'vitest'
import {
  UserType,
  getUserLimits,
  getImageCountOptions,
  getAvailableModels,
  hasFeature,
  needsUpgrade,
  getUpgradeSuggestion,
  freeUserLimits,
  registeredUserLimits,
  premiumUserLimits,
} from '@/lib/user-tiers'

describe('user-tiers', () => {
  describe('getUserLimits', () => {
    it('should return free user limits for ANONYMOUS', () => {
      const limits = getUserLimits(UserType.ANONYMOUS)
      expect(limits).toEqual(freeUserLimits)
      expect(limits.maxImages).toBe(2)
      expect(limits.hourlyLimit).toBe(10)
      expect(limits.requiresTurnstile).toBe(true)
    })

    it('should return registered user limits for REGISTERED', () => {
      const limits = getUserLimits(UserType.REGISTERED)
      expect(limits).toEqual(registeredUserLimits)
      expect(limits.maxImages).toBe(4)
      expect(limits.hourlyLimit).toBe(30)
      expect(limits.requiresTurnstile).toBe('smart')
    })

    it('should return premium user limits for PREMIUM', () => {
      const limits = getUserLimits(UserType.PREMIUM)
      expect(limits).toEqual(premiumUserLimits)
      expect(limits.maxImages).toBe(12)
      expect(limits.hourlyLimit).toBe(Infinity)
      expect(limits.requiresTurnstile).toBe(false)
    })

    it('should fallback to free user limits for unknown user type', () => {
      const limits = getUserLimits('unknown' as UserType)
      expect(limits).toEqual(freeUserLimits)
    })
  })

  describe('getImageCountOptions', () => {
    it('should return 2 options for ANONYMOUS users', () => {
      const options = getImageCountOptions(UserType.ANONYMOUS)
      expect(options).toHaveLength(2)
      expect(options.map(o => o.value)).toEqual([1, 2])
    })

    it('should return 4 options for REGISTERED users', () => {
      const options = getImageCountOptions(UserType.REGISTERED)
      expect(options).toHaveLength(4)
      expect(options.map(o => o.value)).toEqual([1, 2, 3, 4])
    })

    it('should return 7 options including premium for PREMIUM users', () => {
      const options = getImageCountOptions(UserType.PREMIUM)
      expect(options).toHaveLength(7)
      expect(options.map(o => o.value)).toEqual([1, 2, 3, 4, 6, 8, 12])
      expect(options.filter(o => o.premium)).toHaveLength(3)
    })
  })

  describe('getAvailableModels', () => {
    it('should return only pro for ANONYMOUS', () => {
      expect(getAvailableModels(UserType.ANONYMOUS)).toEqual(['pro'])
    })

    it('should return pro and max for REGISTERED', () => {
      expect(getAvailableModels(UserType.REGISTERED)).toEqual(['pro', 'max'])
    })

    it('should return pro and max for PREMIUM', () => {
      expect(getAvailableModels(UserType.PREMIUM)).toEqual(['pro', 'max'])
    })
  })

  describe('hasFeature', () => {
    it('should deny batchGeneration for ANONYMOUS', () => {
      expect(hasFeature(UserType.ANONYMOUS, 'batchGeneration')).toBe(false)
    })

    it('should allow historySync for REGISTERED', () => {
      expect(hasFeature(UserType.REGISTERED, 'historySync')).toBe(true)
    })

    it('should deny privateMode for REGISTERED', () => {
      expect(hasFeature(UserType.REGISTERED, 'privateMode')).toBe(false)
    })

    it('should allow all features for PREMIUM', () => {
      expect(hasFeature(UserType.PREMIUM, 'batchGeneration')).toBe(true)
      expect(hasFeature(UserType.PREMIUM, 'privateMode')).toBe(true)
      expect(hasFeature(UserType.PREMIUM, 'priorityQueue')).toBe(true)
      expect(hasFeature(UserType.PREMIUM, 'apiAccess')).toBe(true)
      expect(hasFeature(UserType.PREMIUM, 'commercialLicense')).toBe(true)
    })
  })

  describe('needsUpgrade', () => {
    it('should return true when requesting more images than allowed', () => {
      expect(needsUpgrade(UserType.ANONYMOUS, 3)).toBe(true)
      expect(needsUpgrade(UserType.REGISTERED, 5)).toBe(true)
    })

    it('should return false when within limits', () => {
      expect(needsUpgrade(UserType.ANONYMOUS, 2)).toBe(false)
      expect(needsUpgrade(UserType.PREMIUM, 12)).toBe(false)
    })
  })

  describe('getUpgradeSuggestion', () => {
    it('should suggest sign up for ANONYMOUS', () => {
      const suggestion = getUpgradeSuggestion(UserType.ANONYMOUS)
      expect(suggestion).not.toBeNull()
      expect(suggestion!.nextTier).toBe(UserType.REGISTERED)
    })

    it('should suggest premium for REGISTERED', () => {
      const suggestion = getUpgradeSuggestion(UserType.REGISTERED)
      expect(suggestion).not.toBeNull()
      expect(suggestion!.nextTier).toBe(UserType.PREMIUM)
    })

    it('should return null for PREMIUM', () => {
      expect(getUpgradeSuggestion(UserType.PREMIUM)).toBeNull()
    })
  })
})
