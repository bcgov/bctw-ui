
import { AxiosInstance } from 'axios';
import { createUrl } from 'api/api_helpers';
import { ICode, ICodeHeader } from 'types/code';
import { IGetCodeProps } from './api_interfaces';

export const codeApi = (api: AxiosInstance) => {

  const getCodes = async (props: IGetCodeProps): Promise<ICode[]> => {
    const { page, codeHeader } = props;
    const url = createUrl({ api: 'get-code', query: `codeHeader=${codeHeader}` });
    // console.log(`requesting ${codeHeader} codes`);
    const { data } = await api.get(url);
    return data[0];
  };

  const getCodeHeaders = async (): Promise<ICodeHeader[]> => {
    const url = createUrl({ api: 'get-code-headers' });
    // console.log('requesting code headers')
    const { data } = await api.get(url);
    return data;
  }
  return {
    getCodes,
    getCodeHeaders,
  }
}