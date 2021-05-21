import { Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { RouteKey } from 'AppRouter';
import { Icon } from 'components/common';
import { UserContext } from 'contexts/UserContext';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from '@material-ui/icons';
import drawerStyles from './drawer_classes';

type SideBarProps = {
  routes: RouteKey[]; // links at top of the drawer
  sidebarContent?: React.ReactNode; // what's displayed in the drawer below the sidebar's navigation section
  collapseAble: boolean;
};

export default function SideBar({ routes, sidebarContent, collapseAble }: SideBarProps): JSX.Element {
  const classes = drawerStyles();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [visibleRoutes, setVisibleRoutes] = useState<RouteKey[]>(routes);
  const [open, setOpen] = React.useState(false);
  const userChanges = useContext(UserContext);

  const handleDrawerOpen = (): void => setOpen((o) => !o);

  // enable user to see admin page if they have the role
  useEffect(() => {
    const updateComponent = (): void => {
      if (userChanges?.ready) {
        const user = userChanges.user;
        setIsAdmin(user.role_type === 'administrator');
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
      case '/data':
      case '/animals':
      case '/devices':
      case '/codes':
      case '/profile':
      case '/import':
      case '/admin':
        handleSetVisible(['animals', 'codes', 'devices', 'import']);
        return;
    }
  }, [location, isAdmin]); // only fire when these states change

  const routesToShow: RouteKey[] = Object.values(visibleRoutes.sort((a, b) => a.sort - b.sort));
  return (
    <div className={'sidebar'}>
      <Drawer
        variant='permanent'
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          })
        }}>
        {collapseAble ? (
          <div className={'side-panel-toolbar'}>
            <IconButton onClick={handleDrawerOpen}>
              {open ? (
                <ChevronLeft className={'open-close'} htmlColor='white' />
              ) : (
                <ChevronRight className={'open-close'} htmlColor='white' />
              )}
            </IconButton>
          </div>
        ) : null}
        <Divider />
        <List>
          {routesToShow.map((route: RouteKey, idx: number) => {
            return (
              <ListItem button={true} key={idx} {...{ component: Link, to: route.path }}>
                {route.icon ? (
                  <Tooltip title={route.title}>
                    <ListItemIcon className={'sidebar-icon'}>
                      <Icon icon={route.icon} />
                    </ListItemIcon>
                  </Tooltip>
                ) : null}
                <ListItemText className={'list-item-txt'} primary={route.title} />
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Divider />
      <div>{sidebarContent}</div>
    </div>
  );
}
