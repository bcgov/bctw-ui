import { AxiosError } from 'axios';

/**
 * formats an Axios error to a string
 */
const formatAxiosError = (err: AxiosError): string => {
  const body = err?.response?.data;
  if(body){
    return body.error ?? body.message ?? body.Message ?? body;
  }else{
    err?.message ?? 'an error occured';
  }
}
//   return `${
//     err?.response?.data?.error || 
//     err?.response?.data?.message ||
//     err?.response?.data?.Message ||
//     err?.response?.data || 
//     err?.message || 
//     'An error occured'}`;
// }
  
export { formatAxiosError };
