import AddUser from 'pages/onboarding/AddUser'
import AdminHandleRequestPermissionPage from 'pages/permissions/AdminHandleRequestPermission';
import CodePage from 'pages/data/codes/CodePage';
import CollarPage from 'pages/data/collars/CollarPage';
import CritterPage from 'pages/data/animals/CritterPage';
import Home from 'pages/Home';
import Import from 'pages/data/bulk/Import';
// import Logout from 'pages/Logout';
import MapPage from 'pages/map/MapPage';
import GrantCritterAccessPage from 'pages/permissions/GrantCritterAccessPage';
// import TerrainPage from 'pages/terrain/TerrainPage';
import OwnerRequestPermission from 'pages/permissions/OwnerRequestPermission';
import UserAdminPage from 'pages/admin/UserAdmin';
import UserProfile from 'pages/user/UserProfile';

import { FunctionComponent } from 'react';
import { Redirect, Route, Switch, BrowserRouter } from 'react-router-dom';
// import { useHistory } from 'react-router-dom';

export type RouteKey = {
  path: string;
  title: string;
  name: string;
  component: FunctionComponent<{ /*setSidebarContent: (component: JSX.Element) => void */ }>;
  sort: number;
  icon?: string;
  requiresAdmin?: boolean;
};

const AppRoutes: RouteKey[] = [
  { name: 'animals', path: '/animals', title: 'Animals', component: CritterPage, sort: 2, icon: 'critter' },
  { name: 'animal-access', path: '/animal-access', title: 'Animal Access', component: GrantCritterAccessPage, sort: 8, icon: 'filter' },
  { name: 'codes', path: '/codes', title: 'Code Tables', component: CodePage, sort: 10, icon: 'code' },
  { name: 'devices', path: '/devices', title: 'Devices', component: CollarPage, sort: 3, icon: 'collar' },
  { name: 'home', path: '/home', title: 'Home', component: Home, sort: 0, icon: 'home' },
  { name: 'handle-permission-request', path: '/handle-permission-request', title: 'Requests', component: AdminHandleRequestPermissionPage, sort: 7, icon: 'edit' },
  { name: 'import', path: '/import', title: 'Bulk Import', component: Import, sort: 4, icon: 'arrow-up' },
  // { name: 'logout', path: '/logout', title: 'Logout', component: Logout, sort: 99 },
  { name: 'onboarding', path: '/onboarding', title: 'onboarding', component: AddUser, sort: 101 },
  { name: 'owner-access', path: '/owner-access', title: 'Delegation', component: OwnerRequestPermission, sort: 6, icon: 'person' },
  { name: 'map', path: '/map', title: 'Map', component: MapPage, sort: 1, icon: 'map' },
  { name: 'notFound', path: '/*', title: 'Not Found', component: (): JSX.Element => <div>page not found!</div>, sort: 100 },
  { name: 'profile', path: '/profile', title: 'My Profile', component: UserProfile, sort: 5, icon: 'profile' },
  // { name: 'terrain', path: '/terrain', title: 'Terrain Viewer', component: TerrainPage, sort: 1, icon: 'terrain' },
  { name: 'user-admin', path: '/user-admin', title: 'Users', component: UserAdminPage, sort: 9, icon: 'admin' }
];

const AppRouter = (): JSX.Element => {

  /*
  const history = useHistory();
  useEffect(() => {
    return history.listen((location) => {
      // wipe the sidebar content when navigation to new page
      onContentChange(null);
    });
  }, [history]);
  */

  return (
    <BrowserRouter>
      <Switch>
        <Redirect exact from='/' to='/home' />
        <Redirect exact from='/manage' to='/animals' />
        <Redirect exact from='/?onboarding=true' to='/onboarding' />
        {AppRoutes.map((route: RouteKey, idx: number) => {
          return (
            <Route
              key={idx}
              path={route.path}
              render={(): JSX.Element => {
                const RouteComponent = route.component;
                return <RouteComponent />;
              }}
            />
          );
        })}
      </Switch>
    </BrowserRouter>
  );
};

export { AppRouter, AppRoutes };