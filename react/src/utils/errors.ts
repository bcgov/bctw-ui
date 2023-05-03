import { AxiosError } from 'axios';

/**
 * formats an Axios error to a string
 */
const formatAxiosError = (err: AxiosError): string => {
  const e = err?.response?.data;
  // if (e.errors) {
  //   const keys = Object.keys(e.errors);
  //   console.log(keys);
  //   e.errors[]
  // }
  return JSON.stringify(
    e?.error || e?.message || e?.Message || e?.errors || e || err?.message || 'An error occured',
    null,
    ' '
  );
};

export { formatAxiosError };
