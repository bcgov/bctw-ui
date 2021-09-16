const IS_PROD = +(window.location.port) === 1111 ? false : true;
interface CreateUrlParams {
  api: string;
  query?: string;
  page?: number;
  testUser?: string;
}

const getBaseUrl = (): string => {
  const h1 = window.location.protocol;
  const h2 = window.location.hostname;
  const h3 = IS_PROD ? window.location.port : 3000;
  const h4 = IS_PROD ? '/api' : '';
  const url = `${h1}//${h2}:${h3}${h4}`;
  return url;
}

const _appendQueryToUrl = (url: string, query: string): string => {
  if (!query) return url;
  return url.includes('?') ?
    url += `&${query}` :
    url += `?${query}`;
};

/**
 * todo: doc 
 */
const createUrl = ({api, query, page, testUser}: CreateUrlParams): string => {
  const baseUrl = getBaseUrl();
  console.log('createURL() -- base URL:', baseUrl)
  let url = `${baseUrl}/${api}`;
  if (query && query.length) {
    url = _appendQueryToUrl(url, query);
  }
  if (!IS_PROD) {
    url = _appendQueryToUrl(url, `idir=${process.env.REACT_APP_IDIR}`);
  }
  if (page) {
    url = _appendQueryToUrl(url, `page=${page}`)
  }
  if (testUser) {
    url = _appendQueryToUrl(url, `testUser=${testUser}`)
    // console.log('retrieving url with testuser ${testUser}');
  }
  console.log('createURL() -- final created URL:', url)
  return url;
}

// used by form handlers to upload files to the server
const createFormData = (name: string, files: FileList): FormData => {
  const formData = new FormData();
  Array
    .from(Array(files.length).keys())
    .map(i => formData.append(name, files[i], files[i].name))
  return formData;
}

const isDev = (): boolean => {
  return process?.env?.NODE_ENV === 'development';
}

export {
  getBaseUrl,
  createUrl,
  createFormData,
  isDev,
}