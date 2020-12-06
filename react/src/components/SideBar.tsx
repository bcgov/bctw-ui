import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Typography } from '@material-ui/core';
import headerImage from '../images/bcgov-header-vert-MD.png';

const headerStyles = makeStyles((theme) => ({
  header: {
    background: '#036',
    textAlign: 'left',
    color: 'white',
    backgroundImage: `url(${headerImage})`,
    backgroundRepeat: 'no-repeat',
    height: '4.1rem'
  },
  headerText: {
    marginTop: 0,
    marginLeft: '4rem'
  }
}))

const SideBarHeader = () => { 
  const classes = headerStyles();
  return (
    <div className={classes.header}>
      <div className={classes.headerText}>
        <Typography variant='h6'>BCTW</Typography>
        <Typography paragraph>Caribou Recovery Program</Typography>
      </div>
    </div>
  )
}

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
})); 

type SideBarProps = {
  children: React.ReactNode;
}

export default function PermanentDrawerLeft({children}: SideBarProps) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <CssBaseline />
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{ paper: classes.drawerPaper, }}
        anchor="left"
      >
        <SideBarHeader />
        <Divider />
        <List>
          {['Home', 'Location Map', 'Terrain Viewer', 'Data Management'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  );
}