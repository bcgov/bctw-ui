import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Home from 'pages/Home';
import MapPage from 'pages/map/MapPage';
import TerrainPage from 'pages/terrain/TerrainPage';
import DataPage from 'pages/data/DataPage';

type IAppRouterProps = {}

const AppRouter: React.FC<IAppRouterProps> = (props) => {
  return (
    <Switch>
      <Redirect exact from="/" to="/home" />
      <Route path="/map" component={MapPage} />
      <Route path="/terrain" component={TerrainPage} />
      <Route path="/data" component={DataPage} />
      <Route path="/home" component={Home} />
      <Route path="/*" component={() =><div>not found :(</div>} />
    </Switch>
  )
}

export default AppRouter;