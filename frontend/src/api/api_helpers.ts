import moment from 'moment';
import { request } from 'needle';

const appendQueryToUrl = (url: string, query: string): string => {
  return url.includes('?') ?
    url += `&${query}` :
    url += `?${query}`;
};
interface CreateUrlParams {
  context: any;
  apiString: string;
  queryString?: string;
  page?: number;
}
const createUrl2 = ({context, apiString, queryString, page}: CreateUrlParams) => {
  return createUrl(context, apiString, queryString, page);
};

const retrieveRootState = (context) => {
  if (context.rootState) {
    return {
      state: context.rootState.rootModule,
    };
  }
  return context;
};

const createUrl = (
    context,
    apiString: string,
    queryString?: string,
    page?: number,
  ): string => {
    const rootState = retrieveRootState(context);
    const h1 = location.protocol;
    const h2 = location.hostname;
    const h3 = rootState.state.prod ? location.port : 3000;
    const h4 = rootState.state.prod ? '/api' : '';
    let url = `${h1}//${h2}:${h3}${h4}/${apiString}`;
    if (queryString) {
      url = appendQueryToUrl(url, queryString);
    }
    if (isDev) {
      url = appendQueryToUrl(url, `idir=${process.env.IDIR}`);
    }
    if (page) {
      appendQueryToUrl(url, `page=${page}`);
    }
    const u = context.getters.testUser;
    if (u) {
      const requestsToIgnore = ['get-code', 'get-code-headers', 'add-code-headers'];
      if (u && u.indexOf('default') === -1 && !requestsToIgnore.includes(apiString)) {
        console.log(`createUrl: test user is: ${u}`);
        url = appendQueryToUrl(url, `testUser=${u}`);
      }
    }
    return url;
};

const createOptions = (obj) => {
  return {
    compressed: true,
    follow: 10,
    ...obj,
  };
};

const isDev = process.env.ENV === 'DEV';

// response: resolved fetch response
// payload: object containing a function called callback
const handleFetchResult = (response: Response, callback) => {
  if (response.ok && response.headers.get('content-type')) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      response.json().then((d) => callback(d));
    } else {
      response.text().then((d) => callback(d));
    }
  } else {
    // bad status returned, probably can't parse as json.
    response.text().then((e) => callback(null, e));
  }
};

// const formattedNow = () => new Date(Date.now()).toISOString().replace('T', ' ').replace('Z', '');
const formattedNow = () => moment().format('YYYY-MM-DD HH:mm:ss');

/// filters object key/values to only include those in the propsAllowed array
const filterObj = (o: object, propsAllowed: string[]) => {
  return Object.keys(o)
  .filter((key) => propsAllowed.includes(key))
  .reduce((obj, key) => {
    obj[key] = o[key];
    return obj;
  }, {});
};

export {
  createUrl,
  createUrl2,
  createOptions,
  isDev,
  filterObj,
  formattedNow,
  handleFetchResult,
};

