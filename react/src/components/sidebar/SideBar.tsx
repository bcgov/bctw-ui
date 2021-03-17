import { Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { RouteKey } from 'AppRouter';
import { Icon } from 'components/common';
import { UserContext } from 'contexts/UserContext';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type SideBarProps = {
  routes: RouteKey[]; // links at top of the drawer
  sidebarContent?: React.ReactNode; // what's displayed in the drawer below the sidebar's navigation section
};

export default function SideBar({ routes, sidebarContent }: SideBarProps): JSX.Element {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [visibleRoutes, setVisibleRoutes] = useState<RouteKey[]>(routes);
  const userChanges = useContext(UserContext);

  useEffect(() => {
    const updateComponent = (): void => {
      if (userChanges?.ready) {
        const user = userChanges.user;
        setIsAdmin(user.role_type === 'administrator');
        // only show admin page if user idir also matches the test user
        // if (user.idir === userChanges.testUser) {
        //   setIsAdmin(user.role_type === 'administrator');
        // } else {
        //   setIsAdmin(false);
        // }
      }
    };
    updateComponent();
  }, [userChanges]);

  const handleSetVisible = (routeNames: string[]): void => {
    const curRoutes = routes.filter((r) => routeNames.includes(r.name));
    if (isAdmin) {
      curRoutes.push(routes.find((r) => r.name === 'admin'));
    }
    setVisibleRoutes(curRoutes);
  };

  useEffect(() => {
    switch (location.pathname) {
      case '/home':
        handleSetVisible(['map', 'terrain', 'data']);
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
      case '/admin':
        handleSetVisible(['home']);
        return;
      case '/profile':
        handleSetVisible(['home', 'map', 'terrain', 'data']);
        return;
    }
  }, [location, isAdmin]); // only fire when these states change

  const routesToShow: RouteKey[] = Object.values(visibleRoutes.sort((a, b) => a.sort - b.sort));
  return (
    <div className={'sidebar'}>
      <List>
        {routesToShow.map((route: RouteKey, idx: number) => {
          return (
            <ListItem button={true} key={idx} {...{ component: Link, to: route.path }}>
              {route.icon ? (
                <ListItemIcon className={'test'}>
                  <Icon icon={route.icon} />
                </ListItemIcon>
              ) : null}
              <ListItemText primary={route.title} />
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <div> {sidebarContent} </div>
    </div>
  );
}
