import CritterPage from 'pages/data/animals/CritterPage';
import CodePage from 'pages/data/codes/CodePage';
import CollarPage from 'pages/data/collars/CollarPage';
import Home from 'pages/Home';
import AddUser from 'pages/onboarding/AddUser'
import MapPage from 'pages/map/MapPage';
import Import from 'pages/data/bulk/Import';
// import TerrainPage from 'pages/terrain/TerrainPage';
import GrantCritterAccessPage from 'pages/permissions/GrantCritterAccessPage';
import UserProfile from 'pages/user/UserProfile';
import { FunctionComponent } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
// import { useHistory } from 'react-router-dom';
import UserAdminPage from 'pages/admin/UserAdmin';
import OwnerRequestPermission from 'pages/permissions/OwnerRequestPermission';
import AdminHandleRequestPermissionPage from 'pages/permissions/AdminHandleRequestPermission';
import Logout from 'pages/Logout';

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
  { name: 'onboarding', path: '/onboarding', title: 'onboarding', component: AddUser, sort: 101 },
  { name: 'map', path: '/map', title: 'Map', component: MapPage, sort: 1, icon: 'map' },
  // { name: 'terrain', path: '/terrain', title: 'Terrain Viewer', component: TerrainPage, sort: 1, icon: 'terrain' },
  { name: 'animals', path: '/animals', title: 'Animals', component: CritterPage, sort: 2, icon: 'critter' },
  { name: 'devices', path: '/devices', title: 'Devices', component: CollarPage, sort: 3, icon: 'collar' },
  { name: 'import', path: '/import', title: 'Bulk Import', component: Import, sort: 4, icon: 'arrow-up'},
  { name: 'profile', path: '/profile', title: 'My Profile', component: UserProfile, sort: 5, icon: 'profile' },
  { name: 'owner-access', path: '/owner-access', title: 'Delegation', component: OwnerRequestPermission, sort: 6, icon: 'person' },
  { name: 'handle-permission-request', path: '/handle-permission-request', title: 'Requests', component:AdminHandleRequestPermissionPage, sort: 7, icon: 'edit' },
  { name: 'animal-access', path: '/animal-access', title: 'Animal Access', component: GrantCritterAccessPage, sort: 8, icon: 'filter' },
  { name: 'user-admin', path: '/user-admin', title: 'Users', component: UserAdminPage, sort: 9, icon: 'admin' },
  { name: 'codes', path: '/codes', title: 'Code Tables', component: CodePage, sort: 10, icon: 'code' },
  { name: 'logout', path: '/logout', title: 'Logout', component: Logout, sort: 99 },
  { name: 'notFound', path: '/*', title: 'Not Found', component: (): JSX.Element => <div>page not found!</div>, sort: 100 },
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
    <Switch>
      <Redirect exact from='/' to='/home' />
      <Redirect exact from='/manage' to='/animals' />
      <Redirect exact from='/?page=onboarding' to='/onboarding' />
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
  );
};

export { AppRouter, AppRoutes };
