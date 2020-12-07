import React from 'react';
import { AppRouter } from 'utils/AppRouter';
import { makeStyles } from '@material-ui/core';
import { BrowserRouter as Router } from 'react-router-dom'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    // overflow: 'hidden'
  }
}));

type IAppProps = {}

const App: React.FC<IAppProps> = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Router>
        <AppRouter />
      </Router>
    </div>
  );
}

export default App;
