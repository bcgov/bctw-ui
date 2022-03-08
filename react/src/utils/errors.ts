import { AxiosError } from 'axios';

/**
 * formats an Axios error to a string
 */
const formatAxiosError = (err: AxiosError): string => {
  let msg = err.message || 'An error occured';
  if(err.response === undefined) return msg;
  if(err.response.data === undefined) return msg;
  if(typeof err.response.data !== 'string') return msg;
  msg = err.response.data;
  return `${msg}`;
};

export { formatAxiosError };
