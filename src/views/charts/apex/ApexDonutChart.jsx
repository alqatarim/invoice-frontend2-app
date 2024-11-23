'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import { useColorScheme, useTheme } from '@mui/material/styles'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

import {
  amountFormat
} from '@/common/helper';
// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Util Imports
import { rgbaToHex } from '@/utils/rgbaToHex'

// Vars
const donutColors = {
  series1: 'var(--mui-palette-warning-main)',
  series2: 'var(--mui-palette-success-main)',
  series3: 'var(--mui-palette-primary-main)',
  series4: 'var(--mui-palette-info-main)',
  series5: 'var(--mui-palette-error-main)',


}

const ApexDonutChart = ({ series, labels, amounts, currencyData }) => {
  // Hooks


  const theme = useTheme()
  const { mode, systemMode } = useColorScheme()

  // Vars
  const _mode = (mode === 'system' ? systemMode : mode) || 'light'
  const textSecondary = 'var(--mui-palette-text-secondary)'

  const options = {
    stroke: { width: 0 },
    labels: labels.map((label, index) =>

       `${label}: ${currencyData}${amountFormat(amounts[index] || 0)}`
    ),
    colors: [donutColors.series1, donutColors.series5, donutColors.series3, donutColors.series2],
    dataLabels: {
      enabled: true,
      formatter: val => `${parseInt(val, 10)}`
    },
    legend: {
      fontSize: '14px',
      position: 'bottom',
      markers: { height: 10, width: 10, offsetX: theme.direction === 'rtl' ? 7 : -4 },
      labels: { colors: textSecondary, },
      itemMargin: {
        vertical: 3,
        horizontal: 10
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              fontSize: '1.5rem',
              offsetY: -20
            },
            value: {
              fontSize: '2rem',
              color: textSecondary,
              formatter: val => {

                return `${parseFloat(val)}`
              }
            },
            total: {
              show: true,
              fontSize: '1.5rem',
              label: 'Total',
              formatter: (w) => {

                const total = w.globals.series.reduce((a, b) => a + b, 0);
                return `${total}`;
              },

              color: rgbaToHex(`rgb(${theme.mainColorChannels[_mode]} / 1)`)
            }
          }
        }
      }
    },

    responsive: [
      {
        breakpoint: 992,
        options: {
          chart: {
            height: 380
          },
          legend: {
            position: 'bottom'
          }
        }
      },
      {
        breakpoint: 576,
        options: {
          chart: {
            height: 320
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    fontSize: '1rem'
                  },
                  value: {
                    fontSize: '1rem'
                  },
                  total: {
                    fontSize: '1rem'
                  }
                }
              }
            }
          }
        }
      }
    ]
  }

  return (

    // <AppReactApexCharts type='donut' width='100%' height={400} options={options} series={[20,20,20,20]} />
    <>
    </>

  )
}

export default ApexDonutChart
