'use client'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const LayoutWrapper = props => {
  const { verticalLayout, horizontalLayout } = props
  const { settings } = useSettings()

  // Return the layout based on the layout context
  return (
    <div className='flex flex-col flex-auto' data-skin={settings.skin}>
      {settings.layout === 'horizontal' ? horizontalLayout : verticalLayout}
    </div>
  )
}

export default LayoutWrapper
