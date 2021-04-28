import 'styles/AppLayout.scss';
import 'styles/Data.scss';

import { makeStyles, ThemeProvider } from '@material-ui/core';
import AppHeader from 'components/common/AppHeader';
import { ResponseProvider } from 'contexts/ApiResponseContext';
import { UserContext, UserStateContextProvider } from 'contexts/UserContext';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
// import { ReactQueryDevtools } from 'react-query/devtools'
import { HashRouter } from 'react-router-dom';
import { } from 'react-router-dom'

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
    width: '100vw',
    overflow: 'hidden'
  }
}));

const queryClient = new QueryClient();

export default function App(): JSX.Element {
  const classes = useStyles();
  const [sidebar, setSidebar] = useState<JSX.Element>();

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <ThemeProvider theme={appTheme}>
        <UserStateContextProvider>
          <UserContext.Consumer>
            {(): React.ReactNode => {
              return (
                <HashRouter>
                  <div className={classes.root}>
                    <AppHeader />
                    <div className={'app-body'}>
                      <div className='app-body__inner'>
                        <ResponseProvider>
                          <SnackbarWrapper>
                            <DefaultLayout>
                              <AppRouter onContentChange={setSidebar} />
                            </DefaultLayout>
                          </SnackbarWrapper>
                        </ResponseProvider>
                      </div>
                    </div>
                    <AppFooter/>
                  </div>
                </HashRouter>
              );
            }}
          </UserContext.Consumer>
        </UserStateContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
