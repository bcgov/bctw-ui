const IS_PROD = +(window.location.port) === 1111 ? false : true;

interface CreateUrlParams {
  api: string;
  query?: string;
  page?: number;
}

const getBaseUrl = (): string => {
  const h1 = window.location.protocol;
  const h2 = window.location.hostname;
  const h3 = IS_PROD ? window.location.port : 3000;
  const h4 = IS_PROD ? '/api' : '';
  let url = `${h1}//${h2}:${h3}${h4}`;
  return url;
}

const appendQueryToUrl = (url: string, query: string): string => {
  if (!query) return url;
  return url.includes('?') ?
    url += `&${query}` :
    url += `?${query}`;
};

const createUrl = ({api, query, page}: CreateUrlParams): string => {
  const baseUrl = getBaseUrl();
  let url = `${baseUrl}/${api}`;
  if (query && query.length) {
    url = appendQueryToUrl(url, query);
  }
  if (!IS_PROD) {
    url = appendQueryToUrl(url, `idir=${process.env.REACT_APP_IDIR}`);
  }
  if (page) {
    url = appendQueryToUrl(url, `page=${page}`)
  }
  return url;
}

export {
  getBaseUrl,
  createUrl,
}