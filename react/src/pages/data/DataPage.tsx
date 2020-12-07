import React from 'react';
import { AppRoutes } from 'utils/AppRouter';

import SideBar from 'components/SideBar';

type IDataPageProps = { }

const DataPage: React.FC<IDataPageProps> = (props) => {
  const routes = AppRoutes
    .filter(r => ['home', 'animals', 'collars'].includes(r.name))
    .sort((a,b) => a.sort - b.sort );
  return (
    <div>
      <SideBar children={<div>data management goes here</div>} routes={routes}/>
    </div>
  )
}

export default DataPage;