import CritterPage from 'pages/data/animals/CritterPage';
import CodePage from 'pages/data/codes/CodePage';
import CollarPage from 'pages/data/collars/CollarPage';
import Home from 'pages/Home';
import MapPage from 'pages/map/MapPage';
import Import from 'pages/data/bulk/Import';
import TerrainPage from 'pages/terrain/TerrainPage';
import GrantCritterAccessPage from 'pages/permissions/GrantCritterAccessPage';
import UserProfile from 'pages/user/UserProfile';
import { FunctionComponent } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
// import { useHistory } from 'react-router-dom';
import UserAdminPage from 'pages/admin/UserAdmin';
import OwnerRequestPermission from 'pages/permissions/OwnerRequestPermission';
import AdminHandleRequestPermissionPage from 'pages/permissions/AdminHandleRequestPermission';

export type RouteKey = {
  path: string;
  title: string;
  name: string;
  component: FunctionComponent<{ /*setSidebarContent: (component: JSX.Element) => void */ }>;
  sort: number;
  icon?: string;
  requiresAdmin?: boolean;
};


const adminTitle = '(Administrator)';
const AppRoutes: RouteKey[] = [
  { name: 'animals', path: '/animals', title: 'Animals', component: CritterPage, sort: 1, icon: 'critter' },
  { name: 'codes', path: '/codes', title: 'Codes', component: CodePage, sort: 2, icon: 'code' },
  { name: 'devices', path: '/devices', title: 'Devices', component: CollarPage, sort: 1, icon: 'collar' },
  { name: 'import', path: '/import', title: 'Import', component: Import, sort: 4, icon: 'arrow-up'},
  { name: 'map', path: '/map', title: 'Location Map', component: MapPage, sort: 1, icon: 'map' },
  { name: 'terrain', path: '/terrain', title: 'Terrain Viewer', component: TerrainPage, sort: 1, icon: 'terrain' },
  { name: 'home', path: '/home', title: 'Home', component: Home, sort: 0, icon: 'home' },
  { name: 'profile', path: '/profile', title: 'Profile', component: UserProfile, sort: 2, icon: 'profile' },
  { name: 'animal-access', path: '/animal-access', title: `Manage User Animal Access ${adminTitle}`, component: GrantCritterAccessPage, sort: 5, icon: 'filter' },
  { name: 'owner-access', path: '/owner-access', title: 'Owner Access', component: OwnerRequestPermission, sort: 5, icon: 'person' },
  { name: 'handle-permission-request', path: '/permission-requests', title: 'Grant Permission Requests', component: AdminHandleRequestPermissionPage, sort: 5, icon: 'edit' },
  { name: 'user-admin', path: '/user-admin', title: `Manage Users ${adminTitle}`, component: UserAdminPage, sort: 5, icon: 'admin' },
  { name: 'notFound', path: '/*', title: 'Not Found', component: (): JSX.Element => <div>page not found!</div>, sort: 100 }
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
      <Redirect exact from='/' to='/map' />
      <Redirect exact from='/data' to='/animals' />
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
