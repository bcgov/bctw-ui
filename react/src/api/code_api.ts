import { createUrl } from 'api/api_helpers';
import { ICode, ICodeHeader } from 'types/code';
import { API, ApiProps, IBulkUploadResults } from './api_interfaces';

// all code retrievals must provide the code_header.code_header_name as a parameter
export interface IGetCodeProps {
  page: number;
  codeHeader: string;
}

export const codeApi = (props: ApiProps): API => {
  const { api } = props;

  /**
   * fetches codes for a code header 
   */
  const getCodes = async (props: IGetCodeProps): Promise<ICode[]> => {
    const { page, codeHeader } = props;
    const url = createUrl({ api: 'get-code', query: `codeHeader=${codeHeader}`, page });
    // console.log(`requesting ${codeHeader} codes`);
    const { data } = await api.get(url);
    return data;
  };

  /**
   * fetches long description for a code name
   * used in frontend ui for updateable text 
   */
  const getCodeLongDesc = async (codeName: string): Promise<string> => {
    const url = createUrl({api: 'get-code-long-desc', query: `codeName=${codeName}`});
    const {data} = await api.get(url);
    const desc = data.rows[0].code_description_long
    return desc;
  }
  /**
   * fetches a list of code headers
   * note: not currently in use
   */
  const getCodeHeaders = async (): Promise<ICodeHeader[]> => {
    const url = createUrl({ api: 'get-code-headers' });
    const { data } = await api.get(url);
    return data;
  };

  /**
   * adds a new code header
   * note: not in use
   */
  const addCodeHeader = async (headers: ICodeHeader[]): Promise<IBulkUploadResults<ICodeHeader>> => {
    const url = createUrl({ api: 'add-code-header' });
    const { data } = await api.post(url, headers);
    return data;
  };

  return {
    addCodeHeader,
    getCodes,
    getCodeHeaders,
    getCodeLongDesc,
  };
};
