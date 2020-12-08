import React from 'react';
import { AppRoutes } from 'utils/AppRouter';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useQueryCache } from 'react-query';

import SideBar from 'components/SideBar';

type IDataPageProps = { }

const Content = () => { 
  const bctwApi = useTelemetryApi();
  const cache = useQueryCache();
  const { status, data, error } = bctwApi.usePingExtent();

  const clickHandler = async () => {
    cache.getQueryData('post')
  }

  return (
    <div>
      {status === 'loading' ? ('loading...')
      : status === 'error' ? (<span>Error: {error?.message || ''}</span>)
      : (
        <>
          <p>data management goes here</p>
          <button onClick={clickHandler}>get pings</button>
          {
            Object.entries(data).map((k,v) => <p>{k}: {v}</p>)
          }
        </>
      )}
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