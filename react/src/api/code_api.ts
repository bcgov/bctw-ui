
import { AxiosInstance } from 'axios';
import { createUrl } from 'api/api_helpers';
import { ICode } from 'types/code';

export const codeApi = (api: AxiosInstance) => {
  const getCodes = async (codeHeader: string): Promise<ICode[]> => {
    const url = createUrl({ api: 'get-code', query: `codeHeader=${codeHeader}` });
    // console.log(`requesting ${codeHeader} codes`);
    const { data } = await api.get(url);
    return data[0];
  };
  return {
    getCodes,
  }
}