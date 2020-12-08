import React from 'react';
import { AppRoutes } from 'utils/AppRouter';
import { useTelemetryApi } from 'hooks/useTelemetryApi';

import SideBar from 'components/SideBar';

type IDataPageProps = { }

const Content = () => { 
  const bctwApi = useTelemetryApi();

  const clickHandler = async () => {
    let data = await bctwApi.requestPingExtent();
    console.log(JSON.stringify(data));
  }
  return (
    <div>
      <p>data management goes here</p>
      <button onClick={clickHandler}>get pings</button>
    </div>
  )
}

const DataPage: React.FC<IDataPageProps> = (props) => {
  const routes = AppRoutes
    .filter(r => ['home', 'animals', 'collars'].includes(r.name))
    .sort((a,b) => a.sort - b.sort );
  return (
    <div>
      <SideBar children={<Content/>} routes={routes}/>
    </div>
  )
}

export default DataPage;