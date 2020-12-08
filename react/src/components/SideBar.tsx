import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Link } from 'react-router-dom';

import SideBarHeader from 'components/SideBarHeader';
import { RouteKey } from 'utils/AppRouter';

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
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  link: {
    textDecoration: 'none',
  },
  toolbar: theme.mixins.toolbar,
})); 

type SideBarProps = {
  children: React.ReactNode; // what's displayed as the <main>
  content?: React.ReactNode; // what's displayed in the drawer below the sidebar's navigation section
  routes: RouteKey[];
}

export default function PermanentDrawerLeft({children, routes, content}: SideBarProps) {
  const classes = useStyles();
  const routesToShow: RouteKey[] = Object.values(routes.sort((a, b) => a.sort -b.sort));
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
          {routesToShow.map((route: RouteKey, idx: number) => (
            <Link className={classes.link} to={route.path} key={idx}>
              <ListItem button>
                <ListItemText primary={route.title} />
              </ListItem>
            </Link>
          ))}
        </List>
        <Divider />
        {content}
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  );
}