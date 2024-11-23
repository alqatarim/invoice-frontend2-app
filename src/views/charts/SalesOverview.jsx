'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import {Icon} from '@iconify/react'
// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionsMenu from '@core/components/option-menu'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const CardWidgetsSalesOverview = ({series, width, labels, amounts, currencyData}) => {
  // Hooks
  const theme = useTheme()
  const textSecondary = 'var(--mui-palette-text-secondary)'

  const options = {
    chart: {
      sparkline: { enabled: true }
    },
    grid: {
      padding: {
        left: 7,
        right: 7
      }
    },

  //    ["PAID","PARTIALLY PAID", "DRAFTED", "OVERDUE"]
// PAID  '#826af9',
// PARTIALLY PAID  '#9f87ff',
// DRAFTED  '#d2b0ff',
// OVERDUE  '#f8d3ff'



    colors: [

      // 'var(--mui-palette-primary-main)',
      // 'rgba(var(--mui-palette-secondary-lightChannel) / 0.2)',
      // 'rgba(var(--mui-palette-primary-mainChannel) / 0.6)',

      // 'rgba(var(--mui-palette-primary-mainChannel) / 0.2)',
      // 'rgba(var(--mui-palette-warning-mainChannel) / 0.3)'
  '#826af9',
'#9f87ff',
'#d2b0ff',
'#feeeee'
      //'var(--mui-palette-customColors-trackBg)'
    ],
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { theme: 'false' },
    dataLabels: { enabled: false },
    labels: labels,
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        customScale: 1,
        donut: {
          size: '75',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              fontSize: '0.875rem',
              color: textSecondary
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              fontSize: '24px',
              formatter: value => `${value}`,
              color: 'var(--mui-palette-text-primary)'
            },
            total: {
              show: true,
              fontSize: '0.875rem',
              label: 'Invoices',
              color: textSecondary,
              formatter: (w) => {

                const total = w.globals.series.reduce((a, b) => a + b, 0);
                return `${total}`;
              },
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 2300,
        options: { chart: { height: 257 } }
      },
      {
        breakpoint: theme.breakpoints.values,
        options: { chart: { height: 276 } }
      },
      {
        breakpoint: 1050,
        options: { chart: { height: 250 } }
      }
    ]
  }

  return (
    <Card>
      <CardHeader
        title='Invoices Overview'
        action={<OptionsMenu iconClassName='text-textPrimary' options={['Last 28 Days', 'Last Month', 'Last Year']} />}
      />
      <CardContent>
        <Grid container>
          <Grid item xs={12} sm={6}  sx={{ mb: [3, 0] }}>
            {/* <AppReactApexCharts type='donut' height={277} width='100%' series={series || []} options={options} /> */}
            <AppReactApexCharts type='donut'  series={[25,10,20,15]} options={options} />
          </Grid>
          <Grid item xs={12} sm={6}  sx={{ my: 'auto' }}>
            <div className='flex items-center gap-3'>
              <CustomAvatar skin='light' color='primary' variant='rounded'>
                <i className='ri-wallet-line text-primary' />
              </CustomAvatar>
              <div className='flex flex-col'>
                <Typography>Number of Invoices</Typography>
                <Typography variant='h5'>{amounts.reduce((a, b) => a + b, 0)} SAR</Typography>

              </div>

{/*
               PAID  '#826af9',
 PARTIALLY PAID  '#9f87ff',
 DRAFTED  '#d2b0ff',
 OVERDUE  '#f8d3ff'
 OVERDUE  '#feeeee
 */}

            </div>
            <Divider className='mlb-6' />
            <Grid container spacing={6}>
              <Grid item xs={6}>
                <div className='flex items-center gap-2 mbe-1'>
                  <div>
                    <Icon   icon='ri-circle-fill' style={{color: '#d2b0ff'}} className={` text-[15px]`} />
                  </div>
                  <Typography>Draft</Typography>
                </div>
                <Typography variant='h6'>{amounts[0]} SAR</Typography>
              </Grid>
              <Grid item xs={6}>
                <div className='flex items-center gap-2 mbe-1'>
                  <div>
                  <Icon   icon='ri-circle-fill' style={{color: '#9f87ff'}} className={` text-[15px]`} />
                  </div>
                  <Typography>Partially Paid</Typography>
                </div>
                <Typography variant='h6'>{amounts[1]} SAR</Typography>
              </Grid>
              <Grid item xs={6}>
                <div className='flex items-center gap-2 mbe-1'>
                  <div>
                  <Icon   icon='ri-circle-fill' style={{color: '#826af9'}} className={` text-[15px]`} />
                  </div>
                  <Typography>Paid</Typography>
                </div>
                <Typography variant='h6'>{amounts[2]} SAR</Typography>
              </Grid>
              <Grid item xs={6}>
                <div className='flex items-center gap-2 mbe-1'>
                  <div>
                  <Icon   icon='ri-circle-fill' style={{color: '#feeeee'}} className={` text-[15px]`} />

                  </div>
                  <Typography>Overdue</Typography>
                </div>
                <Typography variant='h6'>{amounts[3]} SAR</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CardWidgetsSalesOverview
