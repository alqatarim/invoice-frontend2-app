import { redirect } from 'next/navigation'

// Signatures page that redirects to signatures list as default
export default function SignaturesPage() {
  redirect('/settings/signatures/list')
}