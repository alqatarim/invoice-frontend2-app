import Dashboard from '@views/dashboard/Dashboard'
import Grid from '@mui/material/Grid'
import ProtectedComponent from '@/components/ProtectedComponent'



export default function DashboardPage() {

  return(

<ProtectedComponent>
  <Grid container spacing={6}>
  <Dashboard />
    </Grid>
    </ProtectedComponent>

  )
}
