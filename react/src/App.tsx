import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CircularProgress, makeStyles, ThemeProvider } from '@material-ui/core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { AppRouter, AppRoutes } from './AppRouter';
import DefaultLayout from 'pages/layouts/DefaultLayout';
import SideBar from 'components/sidebar/SideBar';
import appTheme from 'themes/appTheme';
import { DatabaseContext, DatabaseContextProvider, IDatabaseContext } from './contexts/DatabaseContext';
import { DatabaseChangesContextProvider } from 'contexts/DatabaseChangesContext';
import { ResponseProvider } from 'contexts/ApiResponseContext';
import { UserStateContextProvider, UserContext, IUserContext } from 'contexts/UserContext';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
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
    <div className={classes.root}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={appTheme}>
          <DatabaseContextProvider>
            <DatabaseContext.Consumer>
              {(databaseContext: IDatabaseContext): React.ReactNode => {
                if (!databaseContext.database) {
                  return <CircularProgress />;
                }
                return (
                  <DatabaseChangesContextProvider>
                    <UserStateContextProvider>
                      <UserContext.Consumer>
                        {(userContext: IUserContext): React.ReactNode => {
                          return (
                            <Router>
                              <SideBar routes={AppRoutes} sidebarContent={sidebar} />
                              <ResponseProvider>
                                <DefaultLayout>
                                  <AppRouter onContentChange={setSidebar} />
                                </DefaultLayout>
                              </ResponseProvider>
                            </Router>
                          );
                        }}
                      </UserContext.Consumer>
                    </UserStateContextProvider>
                  </DatabaseChangesContextProvider>
                );
              }}
            </DatabaseContext.Consumer>
          </DatabaseContextProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen />
      </QueryClientProvider>
    </div>
  );
}
