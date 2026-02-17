import Dashboard from '@views/dashboard/Dashboard'
import Grid from '@mui/material/Grid'
import { getDashboardData } from '@/app/(dashboard)/actions'


export default async function DashboardPage() {
  let initialDashboardData = null

  try {
    const response = await getDashboardData()
    if (response?.code === 200 && response?.data) {
      initialDashboardData = response.data
    }
  } catch (error) {
    console.error('Failed to fetch initial dashboard data:', error)
  }

  return (
    <Grid container spacing={6}>
      <Dashboard initialDashboardData={initialDashboardData} />
    </Grid>
  )
}
