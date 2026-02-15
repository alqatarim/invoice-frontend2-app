
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext';
import { SettingsProvider } from '@core/contexts/settingsContext';
import ThemeProvider from '@components/theme';
import SessionExpiryWatcher from '@/Auth/SessionExpiryWatcher';
import { PermissionsProvider } from '@/Auth/PermissionsContext';
import AppReactToastify from '@/libs/styles/AppReactToastify';
import { getDemoName, getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'


const Providers = ({ children, direction }) => {
  const mode = getMode();
  const settingsCookie = getSettingsFromCookie();
  const demoName = getDemoName();
  const systemMode = getSystemMode();

  return (
    <>
      <SessionExpiryWatcher />
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
    </>
  );
};

export default Providers;
