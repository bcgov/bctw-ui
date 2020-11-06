const urlContainsQuery = (url: string): boolean => url.includes('?');

interface CreateUrlParams {
  context: any;
  apiString: string;
  queryString?: string;
  page?: number;
}
const createUrl2 = ({context, apiString, queryString, page}: CreateUrlParams) {
  return createUrl(context, apiString, queryString, page);
};

const createUrl = (context, apiString: string, queryString?: string, page?: number) => {
  const h1 = location.protocol;
  const h2 = location.hostname;
  const h3 = context.state.prod ? location.port : 3000;
  const h4 = context.state.prod ? '/api' : '';
  let url = `${h1}//${h2}:${h3}${h4}/${apiString}`;
  if (isDev) {
    const q = `idir=${process.env.IDIR}`;
    url += urlContainsQuery(url) ? `&${q}` : `?${q}`;
  }
  if (queryString) {
    url += queryString;
  }
  if (page) {
    url += urlContainsQuery(url) ? `&page=${page}` : `?page=${page}`;
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
  if (response.ok) {
    response.json().then((d) => callback(d));
  } else {
    // bad status returned, probably can't parse as json.
    response.text().then((e) => callback(null, e));
  }
};

const formattedNow = () => new Date(Date.now()).toISOString().replace('T', ' ').replace('Z', '');

export {
  createUrl,
  createUrl2,
  createOptions,
  isDev,
  formattedNow,
  handleFetchResult,
};

