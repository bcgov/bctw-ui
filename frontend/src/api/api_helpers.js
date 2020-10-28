const createUrl = function(context, apiString, queryString) {
  const h1 = location.protocol;
  const h2 = location.hostname;
  const h3 = context.state.prod ? location.port : 3000;
  const h4 = context.state.prod ? '/api' : '';
  let url = `${h1}//${h2}:${h3}${h4}/${apiString}`;
  if (isDev) {
    let q = `idir=${process.env.IDIR}`
    url += url.includes('?') ? `&${q}` : `?${q}`;
  }
  if (queryString) {
    url += queryString;
  }
  return url;
}

const createOptions = (obj) => {
  return {
    compressed: true,
    follow: 10,
    ...obj
  }
}

const isDev = process.env.ENV === 'DEV';

export {
  createUrl,
  createOptions,
  isDev
}