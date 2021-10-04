import { AxiosInstance, AxiosResponse } from 'axios';
import { isDayjs } from 'dayjs';
import { omitNull } from 'utils/common_helpers';
import { formatTime } from 'utils/time';

const IS_PROD = +window.location.port === 1111 ? false : true;
interface CreateUrlParams {
  api: string;
  query?: string;
  page?: number;
  noApiPrefix?: boolean;
}

const getBaseUrl = (noApiPrefix?: boolean): string => {
  const h1 = window.location.protocol;
  const h2 = window.location.hostname;
  const h3 = IS_PROD ? window.location.port : 3000;
  let h4 = '';
  if (!noApiPrefix) h4 = IS_PROD ? '/api' : '';
  const url = `${h1}//${h2}:${h3}${h4}`;
  return url;
};

const _appendQueryToUrl = (url: string, query: string): string => {
  if (!query) return url;
  return url.includes('?') ? (url += `&${query}`) : (url += `?${query}`);
};

/**
 * todo: doc
 */
const createUrl = ({ api, query, page, noApiPrefix }: CreateUrlParams): string => {
  const baseUrl = getBaseUrl(noApiPrefix);
  // console.log('createURL() -- base URL:', baseUrl)
  let url = `${baseUrl}/${api}`;
  if (query && query.length) {
    url = _appendQueryToUrl(url, query);
  }
  if (!IS_PROD) {
    // in dev, add domain and the user identifier to the query
    url = _appendQueryToUrl(url, `${process.env.REACT_APP_DOMAIN}=${process.env.REACT_APP_IDENTIFIER}`);
  }
  if (page) {
    url = _appendQueryToUrl(url, `page=${page}`);
  }
  // console.log('createURL() -- final created URL:', url)
  return url;
};

// used by form handlers to upload files to the server
const createFormData = (name: string, files: FileList): FormData => {
  const formData = new FormData();
  Array.from(Array(files.length).keys()).map((i) => formData.append(name, files[i], files[i].name));
  return formData;
};

const isDev = (): boolean => {
  return process?.env?.NODE_ENV === 'development';
};

// for testing form handlers
async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// removes single quotes from strings
// todo: escape properly
const escapeRegex = (str: string): string => {
  return str.replace(/'/g, '');
};

// 'master' to json converter
const asJSON = <T>(o: T): T => {
  const ret = {} as T;
  for (const [key, value] of Object.entries(o)) {
    if (isDayjs(value)) {
      ret[key] = value.format(formatTime);
    } else if (typeof value === 'string') {
      ret[key] = escapeRegex(value);
    } else {
      ret[key] = value;
    }
  }
  return omitNull(ret);
};

const postJSON =  async<T>(api: AxiosInstance, url: string, body: T): Promise<AxiosResponse> => {
  const json = asJSON(body);
  // eslint-disable-next-line no-console
  console.log('json posted', json);
  return api.post(url, json);
}

export { asJSON, escapeRegex, getBaseUrl, createUrl, createFormData, isDev, sleep, postJSON };
