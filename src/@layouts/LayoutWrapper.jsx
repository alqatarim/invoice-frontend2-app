'use client'

import { useSettings } from '@core/hooks/useSettings'
import useLayoutInit from '@core/hooks/useLayoutInit'

const LayoutWrapper = props => {
  const { systemMode, verticalLayout, horizontalLayout } = props
  const { settings } = useSettings()

  useLayoutInit(systemMode)

  return (
    <div className='flex flex-col flex-auto' data-skin={settings.skin}>
      {settings.layout === 'horizontal' ? horizontalLayout : verticalLayout}
    </div>
  )
}

export default LayoutWrapper
