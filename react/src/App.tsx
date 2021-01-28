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
import { UserStateContextProvider } from 'contexts/UserContext';

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
                      <Router>
                        <SideBar routes={AppRoutes} sidebarContent={sidebar} />
                        <DefaultLayout>
                          <ResponseProvider>
                            <AppRouter onContentChange={setSidebar} />
                          </ResponseProvider>
                        </DefaultLayout>
                      </Router>
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
