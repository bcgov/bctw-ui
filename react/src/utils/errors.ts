import { AxiosError } from 'axios';

/**
 * formats an Axios error to a string
 */
const formatAxiosError = (err: AxiosError): string => {
  const e = err?.response?.data;
  const zodErrors = Object.entries(e?.errors);
  //This might need tweaking if other responses return with errors: {}
  if (zodErrors) {
    //Formatted zod error
    return zodErrors
      .map(
        ([key, valueArr]) =>
          `${key.replace('_', ' ').replace('id', 'ID').toUpperCase()}: ${valueArr ? valueArr[0] : 'error'}`
      )
      .join(',  ');
  }
  const error = e?.error || e?.message || e?.Message || e || err?.message || 'An error occured';
  return typeof error === 'string' ? error : JSON.stringify(error);
};

export { formatAxiosError };
