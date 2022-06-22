import { AxiosError } from 'axios';

/**
 * formats an Axios error to a string
 */
const formatAxiosError = (err: AxiosError): string => {
  const e = err?.response?.data
  return `${
    e?.error ||
    e?.message ||
    e?.Message ||
    e ||
    err?.message ||
    'An error occured'}`;
  // return `${
  //   err?.response?.data?.error || 
  //   err?.response?.data?.message ||
  //   err?.response?.data?.Message ||
  //   err?.response?.data || 
  //   err?.message || 
  //   'An error occured'}`;
}

  
export { formatAxiosError };
