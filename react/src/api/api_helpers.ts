import { AxiosInstance, AxiosResponse } from 'axios';
import { ITableFilter } from 'components/table/table_interfaces';
import { isDayjs } from 'dayjs';
import { omitNull } from 'utils/common_helpers';
import { formatTime } from 'utils/time';
import { CreateUrlParams } from './api_interfaces';

const IS_PROD = +window.location.port === 1111 ? false : true;

//Disabled while fixing alerts bugs...
export const ENABLE_ALERTS = false;

/**
 * @param noApiPrefix if true, exclude '/api' beginning of the base url
 */
const getBaseUrl = (noApiPrefix?: boolean): string => {
  const h1 = window.location.protocol;
  const h2 = window.location.hostname;
  const h3 = IS_PROD ? window.location.port : 3000;
  let h4 = '';
  if (!noApiPrefix) h4 = IS_PROD ? '/api' : '';
  const url = `${h1}//${h2}:${h3}${h4}`;
  return url;
};

/**
 * appends the @param query to @param url
 */
const _appendQueryToUrl = (url: string, query: string): string => {
  if (!query) return url;
  return url.includes('?') ? (url += `&${query}`) : (url += `?${query}`);
};

/**
 * @param search the table filter object
 * @returns a query string with the destructured search object
 */
const searchToQueryString = (search: ITableFilter[]): string => {
  if (!search) {
    return '';
  }
  return search
    .map((s) => {
      const { term, keys } = s;
      const termStr = `&term=${term}`;
      if (Array.isArray(keys)) {
        return `${keys.map((k) => `&keys=${k}`).join('')}${termStr}`;
      }
      return `&keys=${keys}${termStr}`;
    })
    .join('');
};

/**
 * @param api the API endpoint URL
 * if in development mode, uses environment variables from .env.local
 * @returns a query string constructed from params
 */
const createUrl = ({ api, query, page, noApiPrefix, search }: CreateUrlParams): string => {
  const baseUrl = getBaseUrl(noApiPrefix);
  // console.log('createURL() -- base URL:', baseUrl)
  let url = `${baseUrl}/${api}`;
  if (query && query.length) {
    url = _appendQueryToUrl(url, query);
  }
  if (!IS_PROD) {
    // in dev, append domain and the username
    url = _appendQueryToUrl(url, `${process.env.REACT_APP_DOMAIN}=${process.env.REACT_APP_IDENTIFIER}`);
  }
  if (page) {
    url = _appendQueryToUrl(url, `page=${page}`);
  }
  if (search) {
    url += searchToQueryString(search);
  }
  // console.log('created URL:', url)
  return url;
};

// used by form handlers to upload files
const createFormData = (name: string, files: FileList): FormData => {
  const formData = new FormData();
  Array.from(Array(files.length).keys()).map((i) => formData.append(name, files[i], files[i].name));
  return formData;
};

// fetched from .env.local
const isDev = (): boolean => {
  return process?.env?.NODE_ENV === 'development';
};

// for testing form handlers
async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// removes single quotes from strings
// fixme: escape properly
const escapeRegex = (str: string): string => {
  return str.replace(/'/g, '');
};

/**
 * class of @type {T} to JSON converter
 * removes nulls
 * remove "error" properties
 * converts valid dayjs objects to time formatted strings
 */
const asJSON = <T>(o: T): T => {
  const ret = {} as T;
  for (const [key, value] of Object.entries(o)) {
    if (key === 'error') {
      // skip
    } else if (isDayjs(value)) {
      if (value.isValid()) {
        ret[key] = value.format(formatTime);
      }
    } else if (typeof value === 'string') {
      ret[key] = escapeRegex(value);
    } else {
      ret[key] = value;
    }
  }
  return omitNull(ret);
};

/**
 * a post handler that uses the @function asJSON
 * to convert @param body to JSON
 * @param api the api instance
 */
const postJSON = async <T>(api: AxiosInstance, url: string, body: T): Promise<AxiosResponse> => {
  const json = Array.isArray(body) ? body.map((b) => asJSON(b)) : asJSON(body);
  // eslint-disable-next-line no-console
  console.log('json posted', json);
  return api.post(url, json);
};

export { asJSON, escapeRegex, getBaseUrl, createUrl, createFormData, isDev, sleep, postJSON, searchToQueryString };
