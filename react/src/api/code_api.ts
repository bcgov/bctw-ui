import { createUrl } from 'api/api_helpers';
import { ICode, ICodeHeader } from 'types/code';
import { ApiProps, IBulkUploadResults, IGetCodeProps } from './api_interfaces';

export const codeApi = (props: ApiProps) => {
  const { api, testUser } = props;

  const getCodes = async (props: IGetCodeProps): Promise<ICode[]> => {
    const { page, codeHeader } = props;
    const url = createUrl({ api: 'get-code', query: `codeHeader=${codeHeader}`, page });
    // console.log(`requesting ${codeHeader} codes`);
    const { data } = await api.get(url);
    return data[0];
  };

  const getCodeHeaders = async (): Promise<ICodeHeader[]> => {
    const url = createUrl({ api: 'get-code-headers' });
    // console.log('requesting code headers')
    const { data } = await api.get(url);
    return data;
  };

  const addCodeHeader = async (headers: ICodeHeader[]): Promise<IBulkUploadResults<ICodeHeader>> => {
    const url = createUrl({ api: 'add-code-header' });
    const { data } = await api.post(url, headers);
    return data;
  };

  return {
    addCodeHeader,
    getCodes,
    getCodeHeaders
  };
};
