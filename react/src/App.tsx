import 'styles/AppLayout.scss';
import 'styles/Data.scss';

import { makeStyles, ThemeProvider } from '@material-ui/core';
import AppHeader from 'components/common/AppHeader';
import { ResponseProvider } from 'contexts/ApiResponseContext';
import { UserContext, UserStateContextProvider } from 'contexts/UserContext';
import { AlertContext, AlertStateContextProvider } from 'contexts/UserAlertContext';
import { QueryClient, QueryClientProvider } from 'react-query';
// import { ReactQueryDevtools } from 'react-query/devtools'
import { HashRouter } from 'react-router-dom';
import {} from 'react-router-dom';

import appTheme from 'themes/appTheme';

import { AppRouter } from './AppRouter';
import { SnackbarWrapper } from 'components/common';
import DefaultLayout from 'pages/layouts/DefaultLayout';
import AppFooter from 'components/common/AppFooter';

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
                          <HashRouter>
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
                          </HashRouter>
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
