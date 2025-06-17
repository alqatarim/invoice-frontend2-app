import { getProfile } from './actions'
import ProfileIndex from '@/views/profile/index'

export default async function ProfilePage() {
  const { success, data, message } = await getProfile()

  if (!success) {
    console.error('Failed to load profile:', message)
  }

  const initialData = {
    profile: data || {},
    loading: false,
    error: success ? null : message
  }

  return <ProfileIndex initialData={initialData} />
}