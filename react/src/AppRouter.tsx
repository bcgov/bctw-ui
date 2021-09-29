import AdminHandleRequestPermissionPage from 'pages/permissions/AdminHandleRequestPermission';
import CollarPage from 'pages/data/collars/CollarPage';
import CritterPage from 'pages/data/animals/CritterPage';
import GrantCritterAccessPage from 'pages/permissions/GrantCritterAccessPage';
import Home from 'pages/Home';
import Import from 'pages/data/bulk/Import';
import MapPage from 'pages/map/MapPage';
import OwnerRequestPermission from 'pages/permissions/OwnerRequestPermission';
import UserAdminPage from 'pages/admin/UserAdmin';
import UserOnboarding from 'pages/onboarding/UserOnboarding'
import UserProfile from 'pages/user/UserProfile';
import { FunctionComponent } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import OnboardingAdmin from 'pages/admin/OnboardingAdmin';

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
  { name: 'animals', path: '/animals', title: 'My Animals', component: CritterPage, sort: 10, icon: 'animals' },
  { name: 'devices', path: '/devices', title: 'My Devices', component: CollarPage, sort: 11, icon: 'devices' },
  { name: 'profile', path: '/profile', title: 'My Profile', component: UserProfile, sort: 12, icon: 'profile' },
  { name: 'delegation', path: '/delegation', title: 'Delegation', component: OwnerRequestPermission, sort: 13, icon: 'share' },
  { name: 'import', path: '/import', title: 'Data Import', component: Import, sort: 14, icon: 'arrow-up' },
  { name: 'delegation-requests', path: '/delegation-requests', title: 'Delegation Requests', component: AdminHandleRequestPermissionPage, sort: 100, icon: 'edit' },
  { name: 'users', path: '/users', title: 'BCTW Users', component: UserAdminPage, sort: 101, icon: 'admin' },
  { name: 'onboarding-admin', path: '/admin-onboarding', title: 'Onboarding Requests', component: OnboardingAdmin, sort: 102, icon: 'personAdd' },
  { name: 'animal-manager', path: '/animal-manager', title: 'Set Animal Manager', component: GrantCritterAccessPage, sort: 103, icon: 'vpnKey' },
  // { name: 'codes', path: '/codes', title: 'Code Tables', component: CodePage, sort: 104, icon: 'code' },
  { name: 'onboarding', path: '/onboarding', title: 'Onboarding', component: UserOnboarding, sort: 201 },
  { name: 'notFound', path: '/*', title: 'React: Not Found', component: (): JSX.Element => <div>React AppRouter.tsx says: Page not found!</div>, sort: 404 },
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