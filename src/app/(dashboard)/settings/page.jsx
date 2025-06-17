import { redirect } from 'next/navigation'

// Main settings page that redirects to company settings as default
export default function SettingsPage() {
  redirect('/settings/company-settings')
}