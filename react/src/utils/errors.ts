import { AxiosError } from 'axios';

/**
 * formats an Axios error to a string
 */
const formatAxiosError = (err: AxiosError): string => {
  const msg = err?.response?.data;
  return `${msg ?? err.message}`;
};

export { formatAxiosError };
