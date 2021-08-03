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
import { makeStyles, ThemeProvider } from '@material-ui/core';
// import { ReactQueryDevtools } from 'react-query/devtools'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflowY: 'scroll'
  }
}));

const queryClient = new QueryClient();

export default function App(): JSX.Element {
  const classes = useStyles();

  return (
    <QueryClientProvider client={queryClient}>
      {/* uncomment to debug query/caching issues */}
      {/* <ReactQueryDevtools initialIsOpen={false} />  */}
      <ResponseProvider>
        <ThemeProvider theme={appTheme}>
          <AlertStateContextProvider>
            <AlertContext.Consumer>
              {(): React.ReactNode => {
                return (
                  <UserStateContextProvider>
                    <UserContext.Consumer>
                      {(): React.ReactNode => {
                        return (
                          <BrowserRouter>
                            <div className={classes.root}>
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
                    </UserContext.Consumer>
                  </UserStateContextProvider>
                );
              }}
            </AlertContext.Consumer>
          </AlertStateContextProvider>
        </ThemeProvider>
      </ResponseProvider>
    </QueryClientProvider>
  );
}