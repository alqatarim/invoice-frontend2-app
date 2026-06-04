/** Static avatars from frontend/public/images/avatars */
export const DEFAULT_USER_AVATAR_FILES = ['1.png', '2.png', '3.png', '5.png']

const DEFAULT_AVATAR_PREFIX = '/images/avatars/'

const isCustomUserImage = (image = '') => {
  if (!image) {
    return false
  }

  return !image.includes(DEFAULT_AVATAR_PREFIX)
}

/**
 * Resolves the avatar URL shown in the UI.
 * Custom uploads use the API URL; otherwise the persisted/default static avatar is used.
 */
export function resolveUserAvatarUrl({
  image = '',
  defaultAvatar = '',
  userId = '',
} = {}) {
  if (isCustomUserImage(image)) {
    return image
  }

  if (image?.includes(DEFAULT_AVATAR_PREFIX)) {
    return image
  }

  const filename =
    defaultAvatar || pickDeterministicDefaultAvatar(userId)

  return `${DEFAULT_AVATAR_PREFIX}${filename}`
}

export function pickDeterministicDefaultAvatar(userId = '') {
  const seed = String(userId || 'default')
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index)
    hash |= 0
  }

  const avatarIndex = Math.abs(hash) % DEFAULT_USER_AVATAR_FILES.length
  return DEFAULT_USER_AVATAR_FILES[avatarIndex]
}
