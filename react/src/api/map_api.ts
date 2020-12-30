import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { formatDay } from 'utils/time';
import dayjs from 'dayjs';
import { RequestPingParams } from './api_interfaces';

export const mapApi = (api: AxiosInstance) => {

  const requestPingExtent = async (): Promise<any> => {
    const url = createUrl({ api: 'get-ping-extent' });
    const { data } = await api.get(url);
    return data;
  };

  const requestMostRecentPings = async (): Promise<any> => {
    // todo:
  };

  const requestPings = async ({ timeWindow, pingExtent }: RequestPingParams): Promise<any> => {
    const start = dayjs(pingExtent).add(timeWindow[0], 'd').format(formatDay);
    const end = dayjs(pingExtent).add(timeWindow[1], 'd').format(formatDay);
    const url = createUrl({ api: 'get-critters', query: `start=${start}&end=${end}` });
    // console.log('requesting pings', start, end);
    const { data } = await api.get(url);
    return data;
  };

  return {
    requestPingExtent,
    requestPings,
    requestMostRecentPings,
  }
}