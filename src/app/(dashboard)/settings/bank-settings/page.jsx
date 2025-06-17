import { redirect } from 'next/navigation'

// Bank settings page that redirects to bank settings list as default
export default function BankSettingsPage() {
  redirect('/settings/bank-settings/list')
}