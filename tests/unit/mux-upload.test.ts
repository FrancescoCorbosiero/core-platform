import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/mux/client', () => ({
  mux: {
    video: {
      assets: {
        create: vi.fn(),
        retrieve: vi.fn(),
        delete: vi.fn(),
      },
    },
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
  },
}))

import { mux } from '@/lib/mux/client'
import { createMuxAsset, getMuxAsset, deleteMuxAsset, getSignedPlaybackUrl } from '@/lib/mux/upload'

describe('Mux Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createMuxAsset', () => {
    it('should create a Mux asset with signed playback policy', async () => {
      const mockAsset = { id: 'asset-1', playback_ids: [{ id: 'playback-1' }] }
      vi.mocked(mux.video.assets.create).mockResolvedValue(mockAsset as any)

      const result = await createMuxAsset('https://example.com/video.mp4')

      expect(mux.video.assets.create).toHaveBeenCalledWith({
        inputs: [{ url: 'https://example.com/video.mp4' }],
        playback_policies: ['signed'],
        encoding_tier: 'baseline',
      })
      expect(result).toEqual(mockAsset)
    })
  })

  describe('getMuxAsset', () => {
    it('should retrieve a Mux asset by ID', async () => {
      const mockAsset = { id: 'asset-1', status: 'ready' }
      vi.mocked(mux.video.assets.retrieve).mockResolvedValue(mockAsset as any)

      const result = await getMuxAsset('asset-1')

      expect(mux.video.assets.retrieve).toHaveBeenCalledWith('asset-1')
      expect(result).toEqual(mockAsset)
    })
  })

  describe('deleteMuxAsset', () => {
    it('should delete a Mux asset by ID', async () => {
      vi.mocked(mux.video.assets.delete).mockResolvedValue(undefined as any)

      await deleteMuxAsset('asset-1')

      expect(mux.video.assets.delete).toHaveBeenCalledWith('asset-1')
    })
  })

  describe('getSignedPlaybackUrl', () => {
    it('should throw when MUX_SIGNING_KEY_ID is not set', () => {
      delete process.env.MUX_SIGNING_KEY_ID
      delete process.env.MUX_SIGNING_PRIVATE_KEY

      expect(() => getSignedPlaybackUrl('playback-1', 'user-1'))
        .toThrow('MUX_SIGNING_KEY_ID and MUX_SIGNING_PRIVATE_KEY must be set')
    })

    it('should throw when MUX_SIGNING_PRIVATE_KEY is not set', () => {
      process.env.MUX_SIGNING_KEY_ID = 'key-id'
      delete process.env.MUX_SIGNING_PRIVATE_KEY

      expect(() => getSignedPlaybackUrl('playback-1', 'user-1'))
        .toThrow('MUX_SIGNING_KEY_ID and MUX_SIGNING_PRIVATE_KEY must be set')
    })

    it('should return a signed playback URL', () => {
      process.env.MUX_SIGNING_KEY_ID = 'key-id-123'
      process.env.MUX_SIGNING_PRIVATE_KEY = Buffer.from('fake-private-key').toString('base64')

      const url = getSignedPlaybackUrl('playback-1', 'user-1')

      expect(url).toBe('https://stream.mux.com/playback-1.m3u8?token=mock-jwt-token')
    })
  })
})
