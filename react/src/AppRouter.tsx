import CritterPage from 'pages/data/animals/CritterPage';
import CodePage from 'pages/data/codes/CodePage';
import CollarPage from 'pages/data/collars/CollarPage';
import Home from 'pages/Home';
import MapPage from 'pages/map/MapPage';
import TerrainPage from 'pages/terrain/TerrainPage';
import AdminPage from 'pages/user/AdminPage';
import UserProfile from 'pages/user/UserProfile';
import { FunctionComponent, useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

export type RouteKey = {
  path: string;
  title: string;
  name: string;
  component: FunctionComponent<{ setSidebarContent: (component: JSX.Element) => void }>;
  sort: number;
  icon?: string;
  requiresAdmin?: boolean;
};

const AppRoutes: RouteKey[] = [
  {
    name: 'animals',
    path: '/animals',
    title: 'Animals',
    component: CritterPage,
    sort: 1,
    icon: 'critter'
  },
  { name: 'codes', path: '/codes', title: 'Codes', component: CodePage, sort: 1, icon: 'code' },
  { name: 'devices', path: '/devices', title: 'Devices', component: CollarPage, sort: 1, icon: 'collar' },
  { name: 'map', path: '/map', title: 'Location Map', component: MapPage, sort: 1, icon: 'map' },
  { name: 'terrain', path: '/terrain', title: 'Terrain Viewer', component: TerrainPage, sort: 1, icon: 'terrain' },
  { name: 'home', path: '/home', title: 'Home', component: Home, sort: 0, icon: 'home' },
  { name: 'profile', path: '/profile', title: 'Profile', component: UserProfile, sort: 2, icon: 'profile' },
  { name: 'admin', path: '/admin', title: 'Admin', component: AdminPage, sort: 2, icon: 'admin' },
  {
    name: 'notFound',
    path: '/*',
    title: 'Not Found',
    component: (): JSX.Element => <div>page not found!</div>,
    sort: 2
  }
];

type AppRouterProps = {
  onContentChange: (component: JSX.Element) => void;
};

const AppRouter = ({ onContentChange }: AppRouterProps): JSX.Element => {
  const routeProps = { setSidebarContent: onContentChange };
  const history = useHistory();

  useEffect(() => {
    return history.listen((location) => {
      // wipe the sidebar content when navigation to new page
      onContentChange(null);
    });
  }, [history]);

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
              return <RouteComponent {...routeProps} />;
            }}
          />
        );
      })}
    </Switch>
  );
};

export { AppRouter, AppRoutes };
