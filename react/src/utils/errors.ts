import { AxiosError } from 'axios';

/**
 * formats an Axios error to a string
 */
const formatAxiosError = (err: AxiosError): string => {
  let msg = err.message || '';
  if(err.response.data) msg = err.response.data;
  return `${msg}`;
};

export { formatAxiosError };
