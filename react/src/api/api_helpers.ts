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

const appendQueryToUrl = (url: string, query: string): string => {
  if (!query) return url;
  return url.includes('?') ?
    url += `&${query}` :
    url += `?${query}`;
};

const createUrl = ({api, query, page, testUser}: CreateUrlParams): string => {
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
  if (testUser) {
    url = appendQueryToUrl(url, `testUser=${testUser}`)
    // console.log(`retrieving url with testuser ${testUser}`);
  }
  return url;
}

const createFormData = (name: string, files: FileList): FormData => {
  const formData = new FormData();
  Array
    .from(Array(files.length).keys())
    .map(i => formData.append(name, files[i], files[i].name))
  return formData;
}

export {
  getBaseUrl,
  createUrl,
  createFormData,
}