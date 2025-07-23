'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Icon } from '@iconify/react'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))


const MultiBarProgress = ({
     stats=[],
  totalAmount,
  height = 100,
  width = '100%',
  borderColor = 'info',
  showTotal = true,
  ...props
}) => {
  // Hooks
  const theme = useTheme()
  


  // Use provided total amount or calculate from stats as fallback
//   const totalAmount = propTotalAmount || stats.reduce((sum, stat) => sum + Number(stat.stats || 0), 0)


     // Filter stats with values > 0
  const validStats = stats.filter(stat => Number(stat.stats || 0) > 0)
  
   
  // Return null if no valid stats
  if (validStats.length === 0) {
    return null
  }

  // Map colors from stat objects to theme colors

  const colors = validStats.map((stat) => {
    const colorName = stat.color || 'default'
    const themeColor = theme.palette[colorName]
    if (themeColor?.main) {
      if (stat.colorOpacity && themeColor[stat.colorOpacity]) {
        return themeColor[stat.colorOpacity]
      }
      return themeColor.main
    }
    return theme.palette.primary.light
  })


  // Calculate total for percentage
  const total = totalAmount || validStats.reduce((sum, stat) => sum + Number(stat.stats || 0), 0)

  // ApexCharts series data - one series per stat
  const series = validStats.map(stat => ({
    name: stat.title,
    data: [Number(stat.stats || 0), 0]
  }))

  const options = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      // width: width,
      // height: height
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '90%',
        borderRadius: 15
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        const stat = validStats[opts.seriesIndex]
        if (!val || val === 0) return ''
        return stat.isCurrency
          ? `﷼ ${Number(val).toLocaleString()}`
          : Number(val).toLocaleString()
      },
      style: {
        fontWeight: 500,
        fontSize: '14px'
      },
      offsetX: 0,
      offsetY: 0,
      dropShadow: { enabled: false }
    },
    colors: colors,
    xaxis: {
      categories: ['Progress', ''],
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { show: false, labels: { show: false } },
    legend: { show: false },
    tooltip: {
      enabled: true,
      shared: false,
      followCursor: true,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const stat = validStats[seriesIndex]
        const value = Number(stat.stats || 0)
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
        return `
          <div style="display: flex; justify-content: space-between; flex-direction: column; align-items: start; gap: 7px; padding: 12px 15px; background: ${theme.palette.background.paper};  ${theme.palette.divider}; border-radius: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); min-width: 180px;">

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 30px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="width: 14px; height: 14px; background-color: ${colors[seriesIndex]}; border-radius: 3px; display: inline-block; border: 1.5px solid ${theme.palette.divider};"></span>  
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 400; font-size: 1rem; color: ${colors[seriesIndex]}; letter-spacing: 0.01em;">${stat.title}</div>
              </div>
              
              <span style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 1rem; color: ${theme.palette.text.secondary}; font-weight: 500;">${percentage}%</span>
            
            </div>

            <div style="display: flex; align-items: center; gap: 3px;">
            ${stat.isCurrency ? '<span style="font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; font-size: 1em; font-weight: 600; vertical-align: middle; line-height: 1;">﷼</span> ' : ''}
              <span style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-weight: 500; font-size: 1.05rem; color: ${theme.palette.secondary};">
                ${value.toLocaleString()}
              </span>
             
            </div>
            ${stat.trendNumber ? `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 0.92rem; color: ${theme.palette.info.main}; font-weight: 500; letter-spacing: 0.01em;">Count: <span style=\'font-weight:700;color:${theme.palette.info.dark}\'>${stat.trendNumber}</span></div>` : ''}
          </div>
        `
      }
    }
  }

  return (
    <div style={{ width: 600, margin: '40px auto' }}>
      <AppReactApexCharts
        type='bar'
        width={width}
        height={height}
        options={options}
        series={series}
      />
    </div>
  )
}

export default MultiBarProgress 