const appendQueryToUrl = (url: string, query: string): string => {
  if (!query) return url;
  return url.includes('?') ?
    url += `&${query}` :
    url += `?${query}`;
};

export {
  appendQueryToUrl
}