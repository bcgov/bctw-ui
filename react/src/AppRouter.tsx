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
  { name: 'home', path: '/home', title: 'Home', component: Home, sort: 0, icon: 'home' },
  { name: 'map', path: '/map', title: 'Map', component: MapPage, sort: 1 },
  // { name: 'terrain', path: '/terrain', title: 'Terrain Viewer', component: TerrainPage, sort: 2 },
  { name: 'animals', path: '/animals', title: 'Animals', component: CritterPage, sort: 10, icon: 'animals' },
  { name: 'devices', path: '/devices', title: 'Devices', component: CollarPage, sort: 11, icon: 'devices' },
  { name: 'owner-access', path: '/owner-access', title: 'Delegation', component: OwnerRequestPermission, sort: 12, icon: 'share' },
  { name: 'profile', path: '/profile', title: 'My Profile', component: UserProfile, sort: 13, icon: 'profile' },
  { name: 'import', path: '/import', title: 'Bulk Import', component: Import, sort: 14, icon: 'arrow-up' },
  { name: 'user-admin', path: '/user-admin', title: 'Users', component: UserAdminPage, sort: 100, icon: 'admin' },
  { name: 'handle-permission-request', path: '/handle-permission-request', title: 'Onboarding Requests', component: AdminHandleRequestPermissionPage, sort: 101, icon: 'edit' },
  { name: 'animal-access', path: '/animal-access', title: 'Set Animal Manager', component: GrantCritterAccessPage, sort: 102, icon: 'person' },
  { name: 'codes', path: '/codes', title: 'Code Tables', component: CodePage, sort: 103, icon: 'code' },
  // { name: 'logout', path: '/logout', title: 'Logout', component: Logout, sort: 200 },
  { name: 'onboarding', path: '/onboarding', title: 'Onboarding', component: AddUser, sort: 201 },
  { name: 'notFound', path: '/*', title: 'Not Found', component: (): JSX.Element => <div>page not found!</div>, sort: 404 },
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