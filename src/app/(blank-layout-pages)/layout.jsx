// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

const Layout = ({ children, params }) => {
  // Vars
  const direction = i18n.langDirection[params.lang]
  const systemMode = getSystemMode()


  return (
    <Providers  direction={direction}>
      <BlankLayout systemMode={systemMode}>{children}

      </BlankLayout>
    </Providers>
  )
}

export default Layout
