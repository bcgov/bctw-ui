import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'
import { makeStyles } from '@material-ui/core';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';

import { AppRouter, AppRoutes } from 'utils/AppRouter';
import DefaultLayout from 'pages/layouts/DefaultLayout';
import SideBar from 'components/sidebar/SideBar';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    // overflow: 'hidden'
  }
}));

type IAppProps = {}
const queryCache = new QueryCache();

const App: React.FC<IAppProps> = (props) => {
  const classes = useStyles();
  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <div className={classes.root}>
        <Router>
          <SideBar routes={AppRoutes} />
          <DefaultLayout>
            <AppRouter />
          </DefaultLayout>
        </Router>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </ReactQueryCacheProvider>
  );
}

export default App;
