import { AxiosError } from 'axios';

/**
 * formats an Axios error to a string
 */
const formatAxiosError = (err: AxiosError): string => {
  let msg = err.message || '';
  const {response} = err;
  const {data} = response;
  if(typeof data == 'string'){
    msg = data;
  } 
  console.log(msg)
  return `${msg}`;
};

export { formatAxiosError };
