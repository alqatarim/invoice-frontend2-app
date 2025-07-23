import dynamic from 'next/dynamic'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function TestApex() {
  const series = [
    { name: 'Test 1', data: [30, 0] },
    { name: 'Test 2', data: [70, 0] }
  ]
  const options = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, barHeight: '90%', borderRadius: 8 } },
    dataLabels: { enabled: false },
    colors: ['#826af9', '#d2b0ff'],
    xaxis: { categories: ['Progress', ''], labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { show: false, labels: { show: false } },
    legend: { show: false },
    tooltip: { enabled: true, shared: false, followCursor: true, y: { formatter: val => `Value: ${val}` } }
  }
  return (
    <div style={{ width: 600, margin: '40px auto' }}>
      <Chart type='bar' width='100%' height={120} options={options} series={series} />
    </div>
  )
} 