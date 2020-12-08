import React, { FunctionComponent } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Home from 'pages/Home';
import MapPage from 'pages/map/MapPage';
import TerrainPage from 'pages/terrain/TerrainPage';
import DataPage from 'pages/data/DataPage';
import CritterPage from 'pages/data/animals/CritterPage';
import CollarPage from 'pages/data/collars/CollarPage';

type IAppRouterProps = {}

export type RouteKey = {
  path: string;
  title: string;
  name: string;
  component: FunctionComponent;
  sort: number;
}

const AppRoutes: RouteKey[] = [ 
  { name: 'animals', path: '/animals', title: 'Animals', component: CritterPage, sort: 1 },
  { name: 'collars', path: '/collars', title: 'Collars', component: CollarPage, sort: 1 },
  { name: 'map', path: '/map', title: 'Location Map', component: MapPage, sort: 1 },
  { name: 'terrain', path: '/terrain', title: 'Terrain Viewer', component: TerrainPage, sort: 1 },
  { name: 'data', path: '/data', title: 'Data Management', component: DataPage, sort: 1 },
  { name: 'home', path: '/home', title: 'Home', component: Home, sort: 0 },
  { name: 'notFound', path: '/*', title: 'Not Found', component: () => (<div>not found :(</div>), sort: 2 },
]

const AppRouter: React.FC<IAppRouterProps> = (props) => {
  return (
    <Switch>
      <Redirect exact from="/" to="/home" />
      {AppRoutes.map((route: RouteKey, idx: number) => {
        return <Route path={route.path} component={route.component} key={idx} />;
      })}
    </Switch>
  )
}

export {
  AppRouter,
  AppRoutes
}