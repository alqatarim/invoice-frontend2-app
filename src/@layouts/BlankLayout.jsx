'use client'

import classnames from 'classnames'
import { useSettings } from '@core/hooks/useSettings'
import { blankLayoutClasses } from './utils/layoutClasses'

const BlankLayout = ({ children }) => {
  const { settings } = useSettings()

  return (
    <div className={classnames(blankLayoutClasses.root, 'is-full bs-full')} data-skin={settings.skin}>
      {children}
    </div>
  )
}

export default BlankLayout
