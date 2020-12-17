import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CircularProgress, makeStyles, ThemeProvider } from '@material-ui/core';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';

import { AppRouter, AppRoutes } from 'utils/AppRouter';
import DefaultLayout from 'pages/layouts/DefaultLayout';
import SideBar from 'components/sidebar/SideBar';
import appTheme from 'themes/appTheme';
import { DatabaseContext, DatabaseContextProvider, IDatabaseContext } from './contexts/DatabaseContext';
import { DatabaseChangesContextProvider } from 'contexts/DatabaseChangesContext';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    // overflow: 'hidden'
  }
}));

type IAppProps = {};
const queryCache = new QueryCache();

export default function App(props: IAppProps) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <ReactQueryCacheProvider queryCache={queryCache}>
        <ThemeProvider theme={appTheme}>
          <DatabaseContextProvider>
            <DatabaseContext.Consumer>
              {(databaseContext: IDatabaseContext) => {
                if (!databaseContext.database) {
                  return <CircularProgress />;
                }
                return (
                  <DatabaseChangesContextProvider>
                    <Router>
                      <SideBar routes={AppRoutes} />
                      <DefaultLayout>
                        <AppRouter />
                      </DefaultLayout>
                    </Router>
                  </DatabaseChangesContextProvider>
                );
              }}
            </DatabaseContext.Consumer>
          </DatabaseContextProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen />
      </ReactQueryCacheProvider>
    </div>
  );
}
