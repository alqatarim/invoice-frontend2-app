import { redirect } from 'next/navigation'

// Tax settings page that redirects to tax settings list as default
export default function TaxSettingsPage() {
  redirect('/settings/tax-settings/list')
}