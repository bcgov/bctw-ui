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


// response: resolved fetch response
// payload: object containing a function called callback
const handleFetchResult = (response, callback) => {
  if (response.ok) {
    response.json().then(d => callback(d));
  } else {
    // bad status returned, probably can't parse as json.
    response.text().then(e => callback(null, e));
  }
}

export {
  createUrl,
  createOptions,
  isDev,
  handleFetchResult
}

