import React from 'react';
import { makeStyles, Drawer, List, Divider, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import { Link } from 'react-router-dom';
import SideBarHeader from 'components/sidebar/SideBarHeader';
import { RouteKey } from 'utils/AppRouter';

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  drawerRoot: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
})); 

type SideBarProps = {
  routes: RouteKey[]; // links at top of the drawer
  sidebarContent?: React.ReactNode; // what's displayed in the drawer below the sidebar's navigation section
}

export default function SideBar({routes, sidebarContent}: SideBarProps) {
  const classes = useStyles();
  const routesToShow: RouteKey[] = Object.values(routes.sort((a, b) => a.sort -b.sort));
  return (
    <div className={classes.drawerRoot}>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{ paper: classes.drawerPaper, }}
        anchor="left"
      >
        <SideBarHeader />
        <Divider />
        <List>
          {
          routesToShow.map((route: RouteKey, idx: number) => {
            return (
            <ListItem button={true} key={idx} {...{ component: Link, to: route.path}}
            >
              {/* fixme: loading an icon from routekey object? */}
              {/* <ListItemIcon>{route.icon}</ListItemIcon> */}
              <ListItemText primary={route.title} />
            </ListItem>
          )})}
        </List>
        <Divider />
        {sidebarContent}
      </Drawer>
    </div>
  );
}