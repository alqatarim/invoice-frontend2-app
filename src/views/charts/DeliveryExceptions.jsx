'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { lighten, useTheme } from '@mui/material/styles'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))
const deliveryExceptionsChartSeries = [13, 25, 22, 40]



const DeliveryExceptions = ({series, width, labels, amounts, currencyData}) => {

  // Hooks
  const theme = useTheme()

  const options = {
    labels: labels,

    stroke: {
      width: 0
    },
    colors: [
      'var(--mui-palette-success-main)',
      lighten(theme.palette.success.main, 0.2),
      lighten(theme.palette.success.main, 0.4),
      lighten(theme.palette.success.main, 0.6)
    ],
    dataLabels: {
      enabled: false,
      formatter(val) {
        return `${Number.parseInt(val)}%`
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      offsetY: 10,
      markers: {
        width: 8,
        height: 8,
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 8 : -4
      },
      itemMargin: {
        horizontal: 15,
        vertical: 5
      },
      fontSize: '13px',
      fontWeight: 400,
      labels: {
        colors: 'var()',
        useSeriesColors: false
      }
    },
    grid: {
      padding: {
        top: 15
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            value: {
              fontSize: '24px',
              color: 'var(--mui-palette-text-primary)',
              fontWeight: 500,
              offsetY: -20
            },
            name: { offsetY: 20 },
            total: {
              show: true,
              fontSize: '0.9375rem',
              fontWeight: 400,
              label: 'Total',
              color: 'var(--mui-palette-text-secondary)',
              formatter: (w) => {

                const total = w.globals.amounts.reduce((a, b) => a + b, 0);
                return `${total} SAR`;
              },
            }
          }
        }
      }
    }
  }

  return (

    <Card className='bs-full'>
      {/* <CardHeader
        title='Delivery exceptions'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Select All', 'Refresh', 'Share']} />}
      /> */}
      <CardContent>


        <AppReactApexCharts
          type='donut'
          height={336}
          width='100%'
          series={amounts}
          options={options}
        />


       </CardContent>
     </Card>

  )
}

export default DeliveryExceptions
