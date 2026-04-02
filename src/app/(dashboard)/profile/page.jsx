import { getProfile } from './actions'
import ProfileIndex from '@/views/profile/index'

export default async function ProfilePage() {
  let initialProfile = {}
  let initialErrorMessage = ''

  try {
    const { success, data, message } = await getProfile()

    if (!success) {
      console.error('Failed to load profile:', message)
      initialErrorMessage = message || 'Failed to load profile.'
    }

    initialProfile = data || {}
  } catch (error) {
    console.error('Failed to load profile:', error)
    initialErrorMessage = error?.message || 'Failed to load profile.'
  }

  return (
    <ProfileIndex
      initialProfile={initialProfile}
      initialErrorMessage={initialErrorMessage}
    />
  )
}