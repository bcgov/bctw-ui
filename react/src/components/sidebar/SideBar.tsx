import React, { useEffect, useState } from 'react';
import { makeStyles, Drawer, List, Divider, ListItem, ListItemText, ListItemIcon } from '@material-ui/core';
import { Link, useLocation } from 'react-router-dom';
import SideBarHeader from 'components/sidebar/SideBarHeader';
import { RouteKey } from 'AppRouter';
import { Icon } from 'components/common';
// import { User, UserRole } from 'types/user';
// import { UserContext } from 'contexts/UserContext';

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
  const [visibleRoutes, setVisibleRoutes] = useState<RouteKey[]>(routes);
  // const useUser = useContext(UserContext);
  // const [user, setUser] = useState<User>(null);

  // useEffect(() => {
  //   const update = (): void => {
  //     if (useUser.ready) {
  //       setUser(useUser.user);
  //     }
  //   };
  //   update();
  // }, [useUser]);

  const handleSetVisible = (routeNames: string[]): void => {
    // if (useUser.ready) {
    // if (user?.role_type === UserRole.administrator) {
    //   routeNames.push('admin');
    // }
    // }
    setVisibleRoutes(routes.filter((r) => routeNames.includes(r.name)));
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
        handleSetVisible(['home', 'admin']);
        return;
    }
  }, [location]); // only fire this effect when location changes

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
