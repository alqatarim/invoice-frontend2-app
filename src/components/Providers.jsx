
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext';
import { SettingsProvider } from '@core/contexts/settingsContext';
import ThemeProvider from '@components/theme';
import AuthWrapper from '@/components/AuthWrapper';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import AppReactToastify from '@/libs/styles/AppReactToastify';
import { getDemoName, getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'
import { NextAuthProvider } from '@/contexts/nextAuthProvider';


const Providers = ({ children, direction }) => {
  const mode = getMode();
  const settingsCookie = getSettingsFromCookie();
  const demoName = getDemoName();
  const systemMode = getSystemMode();

  return (
  <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
    {/* <AuthWrapper> */}
      <PermissionsProvider>
        <VerticalNavProvider>
          <SettingsProvider settingsCookie={settingsCookie} mode={mode} demoName={demoName}>
            <ThemeProvider direction={direction} systemMode={systemMode}>
              {children}
              <AppReactToastify direction={direction} hideProgressBar />
            </ThemeProvider>
          </SettingsProvider>
        </VerticalNavProvider>
        </PermissionsProvider>
      {/* </AuthWrapper> */}
    </NextAuthProvider>
  );
};

export default Providers;
