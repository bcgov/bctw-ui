import React, { useEffect, useState } from 'react';
import { makeStyles, Drawer, List, Divider, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import { Link, useLocation } from 'react-router-dom';
import SideBarHeader from 'components/sidebar/SideBarHeader';
import { RouteKey } from 'components/common/AppRouter';
import { Icon } from 'components/common';

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

export default function SideBar({ routes, sidebarContent }: SideBarProps) {
  const classes = useStyles();
  const location = useLocation();
  const [visibleRoutes, setVisibleRoutes] = useState<RouteKey[]>(routes);

  useEffect(() => {
    switch (location.pathname) {
    case '/home':
      setVisibleRoutes(routes.filter(r => ['map', 'terrain', 'data'].includes(r.name)));
      return;
    case '/terrain':
    case '/map':
      setVisibleRoutes(routes.filter(r => ['home', 'map', 'terrain', 'data'].includes(r.name)));
      return;
    case '/data':
    case '/animals':
    case '/collars':
      setVisibleRoutes(routes.filter(r => ['home', 'animals', 'collars'].includes(r.name)));
      return;
    }
  }, [location]) // only fire this effect when location changes

  const routesToShow: RouteKey[] = Object.values(visibleRoutes.sort((a, b) => a.sort - b.sort));
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
                <ListItem button={true} key={idx} {...{ component: Link, to: route.path }}
                >
                  {route.icon
                    ? <ListItemIcon><Icon icon={route.icon} /></ListItemIcon>
                    : null
                  }
                  <ListItemText primary={route.title} />
                </ListItem>
              )
            })}
        </List>
        <Divider />
        {sidebarContent}
      </Drawer>
    </div>
  );
}