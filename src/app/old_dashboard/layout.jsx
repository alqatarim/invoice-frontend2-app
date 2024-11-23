import Providers from '@components/Providers'
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'
import Navigation from '@components/layout/vertical/Navigation'
import Header from '@components/layout/horizontal/Header'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import HorizontalFooter from '@components/layout/horizontal/Footer'
import Customizer from '@core/components/customizer'
import ScrollToTop from '@core/components/scroll-to-top'
import AuthGuard from '@/hocs/AuthGuard'
import { Button } from '@mui/material'
import { i18n } from '@configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import { getMode, getSystemMode } from '@core/utils/serverHelpers'

export default async function RootLayout({ children, params }) {
  const direction = i18n.langDirection[params.lang]
  const dictionary = await getDictionary(params.lang)
  const mode = getMode()
  const systemMode = getSystemMode()

  return (
    <html lang={params.lang} dir={direction}>
      <body>
        <Providers direction={direction}>
          <AuthGuard locale={params.lang}>
            <LayoutWrapper
              systemMode={systemMode}
              verticalLayout={
                <VerticalLayout
                  navigation={<Navigation dictionary={dictionary} mode={mode} systemMode={systemMode} />}
                  navbar={<Navbar />}
                  footer={<VerticalFooter />}
                >
                  {children}
                </VerticalLayout>
              }
              horizontalLayout={
                <HorizontalLayout header={<Header dictionary={dictionary} />} footer={<HorizontalFooter />}>
                  {children}
                </HorizontalLayout>
              }
            />
            <ScrollToTop className='mui-fixed'>
              <Button
                variant='contained'
                className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
              >
                <i className='ri-arrow-up-line' />
              </Button>
            </ScrollToTop>
            <Customizer dir={direction} />
          </AuthGuard>
        </Providers>
      </body>
    </html>
  )
}
