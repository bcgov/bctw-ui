import 'styles/AppLayout.scss';
import 'styles/Data.scss';

import AppFooter from 'components/common/AppFooter';
import AppHeader from 'components/common/AppHeader';
import DefaultLayout from 'pages/layouts/DefaultLayout';
import appTheme from 'themes/appTheme';

import { AlertContext, AlertStateContextProvider } from 'contexts/UserAlertContext';
import { AppRouter } from './AppRouter';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ResponseProvider } from 'contexts/ApiResponseContext';
import { SnackbarWrapper } from 'components/common';
import { UserContext, UserStateContextProvider } from 'contexts/UserContext';
import { Theme, StyledEngineProvider } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
// import { ReactQueryDevtools } from 'react-query/devtools'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const queryClient = new QueryClient();

// const useStyles = makeStyles(() => ({
//   root: {
//     display: 'flex',
//     flexDirection: 'column',
//     height: '100vh',
//     overflowY: 'scroll'
//   }
// }));
export default function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      {/* uncomment to debug query/caching issues */}
      {/* <ReactQueryDevtools initialIsOpen={false} />  */}
      <ResponseProvider>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={appTheme}>
            <UserStateContextProvider>
              <UserContext.Consumer>
                {(): React.ReactNode => {
                  return (
                    <AlertStateContextProvider>
                      <AlertContext.Consumer>
                        {(): React.ReactNode => {
                          return (
                            <BrowserRouter>
                              <div className='app-main'>
                                <AppHeader />
                                <div className={'app-body'}>
                                  <div className='app-body__inner'>
                                    <SnackbarWrapper>
                                      <DefaultLayout>
                                        <AppRouter />
                                      </DefaultLayout>
                                    </SnackbarWrapper>
                                  </div>
                                </div>
                                <AppFooter />
                              </div>
                            </BrowserRouter>
                          );
                        }}
                      </AlertContext.Consumer>
                    </AlertStateContextProvider>
                  );
                }}
              </UserContext.Consumer>
            </UserStateContextProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </ResponseProvider>
    </QueryClientProvider>
  );
}
