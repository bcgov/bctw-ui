import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { RouteKey } from 'AppRouter';
import { Icon, Tooltip } from 'components/common';
import { UserContext } from 'contexts/UserContext';
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type SideBarProps = {
  routes: RouteKey[]; // links at top of the drawer
  collapseAble: boolean;
};

export default function SideBar({ routes }: SideBarProps): JSX.Element {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [visibleRoutes, setVisibleRoutes] = useState<RouteKey[]>(routes);
  const useUser = useContext(UserContext);

  // enable user to see admin page if they have the role
  useEffect(() => {
    const updateComponent = (): void => {
      const { user } = useUser;
      if (user) {
        setIsAdmin(user.role_type === 'administrator');
        setIsOwner(user.is_owner);
      }
    };
    updateComponent();
  }, [useUser]);

  const handleSetVisible = (routeNames: string[]): void => {
    const curRoutes = routes.filter((r) => routeNames.includes(r.name));
    if (isAdmin) {
      curRoutes.push(routes.find((r) => r.name === 'animal-manager'));
      curRoutes.push(routes.find((r) => r.name === 'delegation-requests'));
      curRoutes.push(routes.find((r) => r.name === 'onboarding-admin'));
      curRoutes.push(routes.find((r) => r.name === 'users'));
    }
    if (isOwner) {
      curRoutes.push(...routes.filter((r) => ['delegation', 'collectiveunits'].includes(r.name)));
    }
    setVisibleRoutes(curRoutes);
  };

  useEffect(() => {
    switch (location.pathname) {
      case '/animals':
      case '/animal-manager':
      case '/codes':
      case '/devices':
      case '/delegation':
      case '/delegation-requests':
      case '/import':
      case '/onboarding-requests':
      case '/profile':
    }
    handleSetVisible(['animals', 'devices', 'import', 'profile']);
  }, [location, isAdmin, isOwner]); // only fire when these states change

  const routesToShow: RouteKey[] = Object.values(visibleRoutes.sort((a, b) => a.sort - b.sort));
  return (
    <Box className={'sidebar'} id="manage_sidebar" py={2} px={2}>

      <List component='nav' color="primary">
        {routesToShow
          .filter((r) => r.name !== 'notFound' && r.icon)
          .map((route: RouteKey, idx: number) => {
            return (
              <Tooltip key={idx} title={route.title}>
                <ListItem className="side-bar-item" button {...{ component: Link, to: route.path }}>
                  <ListItemIcon>
                    <Icon icon={route.icon} />
                  </ListItemIcon>
                  <ListItemText className={'list-item-txt'} primary={route.title} />
                </ListItem>
              </Tooltip>
            );
          })}
      </List>
      {/* <div>{sidebarContent}</div> */}
    </Box>
  );
}
