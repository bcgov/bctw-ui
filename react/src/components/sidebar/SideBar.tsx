import { Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import { RouteKey } from 'AppRouter';
import { Icon } from 'components/common';
import SideBarHeader from 'components/sidebar/SideBarHeader';
import { UserContext } from 'contexts/UserContext';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  drawerRoot: {
    display: 'flex'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  toolbar: theme.mixins.toolbar
}));

type SideBarProps = {
  routes: RouteKey[]; // links at top of the drawer
  sidebarContent?: React.ReactNode; // what's displayed in the drawer below the sidebar's navigation section
};

export default function SideBar({ routes, sidebarContent }: SideBarProps): JSX.Element {
  const classes = useStyles();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [visibleRoutes, setVisibleRoutes] = useState<RouteKey[]>(routes);
  const userChanges = useContext(UserContext);

  useEffect(() => {
    const updateComponent = (): void => {
      if (userChanges?.ready) {
        const user = userChanges.user;
        setIsAdmin(user.role_type === 'administrator')
      }
    };
    updateComponent();
  }, [userChanges]);

  const handleSetVisible = (routeNames: string[]): void => {
    const curRoutes = routes.filter((r) => routeNames.includes(r.name));
    if (isAdmin) {
      curRoutes.push(routes.find(r => r.name === 'admin'));
    }
    setVisibleRoutes(curRoutes);
  };

  useEffect(() => {
    switch (location.pathname) {
      case '/home':
        handleSetVisible(['map', 'terrain', 'data', 'profile']);
        return;
      case '/terrain':
      case '/map':
        handleSetVisible(['home', 'map', 'terrain', 'data']);
        return;
      case '/data':
      case '/animals':
      case '/collars':
      case '/codes':
        handleSetVisible(['home', 'animals', 'codes', 'collars']);
        return;
      case '/profile':
      case '/admin':
        handleSetVisible(['home']);
        return;
    }
  }, [location, isAdmin]); // only fire when these states change

  const routesToShow: RouteKey[] = Object.values(visibleRoutes.sort((a, b) => a.sort - b.sort));
  return (
    <div className={classes.drawerRoot}>
      <Drawer className={classes.drawer} variant='permanent' classes={{ paper: classes.drawerPaper }} anchor='left'>
        <SideBarHeader />
        <Divider />
        <List>
          {routesToShow.map((route: RouteKey, idx: number) => {
            return (
              <ListItem button={true} key={idx} {...{ component: Link, to: route.path }}>
                {route.icon ? (
                  <ListItemIcon>
                    <Icon icon={route.icon} />
                  </ListItemIcon>
                ) : null}
                <ListItemText primary={route.title} />
              </ListItem>
            );
          })}
        </List>
        <Divider />
        {sidebarContent}
      </Drawer>
    </div>
  );
}
