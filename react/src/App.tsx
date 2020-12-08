import React from 'react';
import { AppRouter } from 'utils/AppRouter';
import { makeStyles } from '@material-ui/core';
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryCache, ReactQueryCacheProvider } from "react-query";
import { ReactQueryDevtools } from "react-query-devtools";

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
          <AppRouter />
        </Router>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </ReactQueryCacheProvider>
  );
}

export default App;
