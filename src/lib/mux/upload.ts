import jwt from 'jsonwebtoken'
import { mux } from './client'

export async function createMuxAsset(fileUrl: string) {
  const asset = await mux.video.assets.create({
    inputs: [{ url: fileUrl }],
    playback_policies: ['signed'],
    encoding_tier: 'baseline',
  })

  return asset
}

export async function getMuxAsset(assetId: string) {
  const asset = await mux.video.assets.retrieve(assetId)
  return asset
}

export async function deleteMuxAsset(assetId: string) {
  await mux.video.assets.delete(assetId)
}

export function getSignedPlaybackUrl(playbackId: string, userId: string): string {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID
  const signingKeyPrivate = process.env.MUX_SIGNING_PRIVATE_KEY

  if (!signingKeyId || !signingKeyPrivate) {
    throw new Error('MUX_SIGNING_KEY_ID and MUX_SIGNING_PRIVATE_KEY must be set')
  }

  const decodedPrivateKey = Buffer.from(signingKeyPrivate, 'base64').toString('ascii')

  const token = jwt.sign(
    {
      sub: playbackId,
      aud: 'v',
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      kid: signingKeyId,
      viewer_id: userId,
    },
    decodedPrivateKey,
    { algorithm: 'RS256', keyid: signingKeyId },
  )

  return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`
}
