import { AxiosInstance, AxiosResponse } from 'axios';
import { ITableFilter } from 'components/table/table_interfaces';
import { isDayjs } from 'dayjs';
import { omitNull } from 'utils/common_helpers';
import { formatTime } from 'utils/time';
import { CreateUrlParams } from './api_interfaces';
const IS_PROD = process.env.NODE_ENV === 'production';
//Disabled while fixing alerts bugs...
export const ENABLE_ALERTS = true;

const getBaseUrl = (): string => {
  const h1 = window.location.protocol;
  const h2 = window.location.hostname;
  const h3 = window.location.port;
  const url = `${h1}//${h2}:${h3}/api`;
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
const _appendSearchQueryToString = (url: string, search: ITableFilter[]): string => {
  if (!search) {
    return '';
  }
  const joined_terms = search
    .map((s) => {
      const { term, keys } = s;
      const termStr = `&term=${term}`;
      if (Array.isArray(keys)) {
        return `${keys.map((k) => `&keys=${k}`).join('')}${termStr}`;
      }
      return `&keys=${keys}${termStr}`;
    })
    .join('');
  return url.includes('?') ? (url += joined_terms) : (url += joined_terms.replace('&', '?')); //This will only replace the first occurence
};

/**
 * @param api the API endpoint URL
 * if in development mode, uses environment variables from .env.local
 * @returns a query string constructed from params
 */
const createUrl = ({ api, query, page, search }: CreateUrlParams): string => {
  const baseUrl = getBaseUrl();
  // console.log('createURL() -- base URL:', baseUrl)
  let url = `${baseUrl}/${api}`;
  if (query && query.length) {
    url = _appendQueryToUrl(url, query);
  }
  if (page) {
    url = _appendQueryToUrl(url, `page=${page}`);
  }
  if (search) {
    url = _appendSearchQueryToString(url, search);
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

export { getBaseUrl, createUrl, createFormData, isDev, postJSON };
