import { FunctionComponent, lazy } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

//Lazy load page components
const Home = lazy(() => import('pages/Home'));
const MapPage = lazy(() => import('pages/map/MapPage'));
const SummaryPage = lazy(() => import('pages/summary/SummaryPage'));
const CritterPage = lazy(() => import('pages/data/animals/CritterPage'));
const CollarPage = lazy(() => import('pages/data/collars/CollarPage'));
const UserProfile = lazy(() => import('pages/user/UserProfile'));
const ManagerRequestPermission = lazy(()=> import('pages/permissions/ManagerRequestPermission'));
const Import = lazy(() => import('pages/data/bulk/Import'));
const ExportV2 = lazy(() => import('pages/data/bulk/ExportV2'));
const AdminHandleRequestPermissionPage = lazy(()=> import('pages/permissions/AdminHandleRequestPermission'));
const UserAdminPage = lazy(() => import('pages/admin/UserAdmin'));
const OnboardingAdmin = lazy(() => import('pages/admin/OnboardingAdmin'));
const GrantCritterAccessPage = lazy(()=> import('pages/permissions/GrantCritterAccessPage'));
const UserOnboarding = lazy(() => import('pages/onboarding/UserOnboarding'));
const VendorAPIPage = lazy(() => import('pages/vendor/TriggerFetchTelemetry'));
const DevPlayground = lazy(() => import('pages/DevPlayground'));

//import AdminHandleRequestPermissionPage from 'pages/permissions/AdminHandleRequestPermission';
//import CollarPage from 'pages/data/collars/CollarPage';
//import CritterPage from 'pages/data/animals/CritterPage';
//import ExportPageV2 from 'pages/data/bulk/ExportV2';
//import GrantCritterAccessPage from 'pages/permissions/GrantCritterAccessPage';
//import Home from 'pages/Home';
//import Import from 'pages/data/bulk/Import';
//import MapPage from 'pages/map/MapPage';
//import ManagerRequestPermission from 'pages/permissions/ManagerRequestPermission';
//import UserAdminPage from 'pages/admin/UserAdmin';
//import UserOnboarding from 'pages/onboarding/UserOnboarding'
//import SummaryPage from 'pages/summary/SummaryPage';
//import UserProfile from 'pages/user/UserProfile';
//import OnboardingAdmin from 'pages/admin/OnboardingAdmin';
//import VendorAPIPage from 'pages/vendor/TriggerFetchTelemetry';
//import ExportV2 from 'pages/data/bulk/ExportV2';
//import { DevPlayground } from 'pages/DevPlayground';



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
  { name: 'summary', path: '/summary', title: 'Map', component: SummaryPage, sort: 1 },
  { name: 'animals', path: '/animals', title: 'My Animals', component: CritterPage, sort: 10, icon: 'animals' },
  { name: 'devices', path: '/devices', title: 'My Devices', component: CollarPage, sort: 11, icon: 'devices' },
  { name: 'profile', path: '/profile', title: 'My Profile', component: UserProfile, sort: 12, icon: 'profile' },
  { name: 'delegation', path: '/delegation', title: 'Delegation', component: ManagerRequestPermission, sort: 13, icon: 'share' },
  { name: 'import', path: '/import', title: 'Data Import', component: Import, sort: 14, icon: 'arrow-up' },
  { name: 'export', path: '/export', title: 'Data Export', component: ExportV2, sort: 15, icon: 'arrow-down' },
  { name: 'delegation-requests', path: '/delegation-requests', title: 'Delegation Requests', component: AdminHandleRequestPermissionPage, sort: 100, icon: 'edit' },
  { name: 'users', path: '/users', title: 'BCTW Users', component: UserAdminPage, sort: 101, icon: 'admin' },
  { name: 'onboarding-admin', path: '/admin-onboarding', title: 'Onboarding Requests', component: OnboardingAdmin, sort: 102, icon: 'personAdd' },
  { name: 'animal-manager', path: '/animal-manager', title: 'Set Animal Manager', component: GrantCritterAccessPage, sort: 103, icon: 'key' },
  { name: 'onboarding', path: '/onboarding', title: 'Onboarding', component: UserOnboarding, sort: 201 },
  { name: 'vendor', path: '/vendor', title: 'Telemetry Retrieval', component: VendorAPIPage, sort: 202, icon: 'devices' },
  { name: 'playground', path: '/playground', title: 'Playground', component: DevPlayground, sort: 203, icon: 'dev' },
  { name: 'notFound', path: '/*', title: 'React: Not Found', component: (): JSX.Element => <div>React AppRouter.tsx says: Page not found!</div>, sort: 404 }
];

const AppRouter = (): JSX.Element => {

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