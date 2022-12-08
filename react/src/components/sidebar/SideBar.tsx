import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { isDev } from 'api/api_helpers';
import { RouteKey } from 'AppRouter';
import { Icon, Tooltip } from 'components/common';
import { UserContext } from 'contexts/UserContext';
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { eUserRole } from 'types/user';

type SideBarProps = {
  routes: RouteKey[]; // links at top of the drawer
  collapseAble: boolean;
};

export default function SideBar({ routes }: SideBarProps): JSX.Element {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCritterManager, setIsCritterManager] = useState(false);
  const [isDataAdmin, setIsDataAdmin] = useState(false);
  const [visibleRoutes, setVisibleRoutes] = useState<RouteKey[]>(routes);
  const useUser = useContext(UserContext);

  // enable user to see admin page if they have the role
  useEffect(() => {
    const updateComponent = (): void => {
      const { user } = useUser;
      if (user) {
        setIsAdmin(user.role_type === eUserRole.administrator);
        setIsCritterManager(user.is_manager);
        setIsDataAdmin(user.role_type === eUserRole.data_administrator);
      }
    };
    updateComponent();
  }, [useUser]);

  const handleSetVisible = (routeNames: string[]): void => {
    const curRoutes = routes.filter((r) => routeNames.includes(r.name));
    if (isAdmin) {
      const adminRoutes = ['import', 'animal-manager', 'delegation-requests', 'onboarding-admin', 'users', 'vendor'];
      curRoutes.push(...routes.filter((r) => adminRoutes.includes(r.name)));
    }
    if (isCritterManager) {
      curRoutes.push(...routes.filter((r) => ['delegation'].includes(r.name)));
    }
    if (isDataAdmin) {
      const dataAdminRoutes = ['animal-manager', 'delegation-requests', 'animal-manager', 'vendor'];
      curRoutes.push(...routes.filter((r) => dataAdminRoutes.includes(r.name)));
    }
    if (isDev()) {
      const testRoutes = ['playground'];
      curRoutes.push(...routes.filter((r) => testRoutes.includes(r.name)));
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
      case '/onboarding-requests':
      case '/profile':
      case '/playground':
    }
    handleSetVisible(['animals', 'devices', 'profile', 'export', 'import']);
  }, [location, isAdmin, isCritterManager, isDataAdmin]); // only fire when these states change

  const routesToShow: RouteKey[] = Object.values(visibleRoutes.sort((a, b) => a.sort - b.sort));
  return (
    <Box className={'sidebar'} id='manage_sidebar' py={2} px={1}>
      <List component='nav'>
        {routesToShow
          .filter((r) => r.name !== 'notFound' && r.icon)
          .map((route: RouteKey, idx: number) => {
            return (
              <Tooltip key={idx} title={route.title}>
                <ListItem className='side-bar-item' button {...{ component: Link, to: route.path }}>
                  <ListItemIcon>
                    <Icon icon={route.icon} />
                  </ListItemIcon>
                  <ListItemText className={'list-item-txt'} primary={route.title} />
                </ListItem>
              </Tooltip>
            );
          })}
      </List>
    </Box>
  );
}
