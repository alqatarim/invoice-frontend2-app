import { Suspense } from 'react'
import Dashboard from '@/views/dashboard/Dashboard'

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  )
}
