import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import { i18n } from '@configs/i18n'

const Layout = ({ children, params }) => {
  const direction = i18n.langDirection[params.lang]

  return (
    <Providers direction={direction}>
      <BlankLayout>{children}</BlankLayout>
    </Providers>
  )
}

export default Layout
