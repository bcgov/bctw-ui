import { isDev } from 'api/api_helpers';
import { AxiosError } from 'axios';

/**
 * formats an Axios error to a string
 */
const formatAxiosError = (err: AxiosError): string => {
  let msg = err.message || 'An error occured';
  console.log(msg)
  if(err.response === undefined) return msg;
  if(err.response.data === undefined) return msg;
  if(err.response.data.error === undefined){
    msg = err.response.data;
  } else {
    msg = err.response.data.error;
  }
  console.log(msg)
  return `${msg}`;
};

export { formatAxiosError };
