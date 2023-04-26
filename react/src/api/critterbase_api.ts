import { plainToClass } from 'class-transformer';
import { Animal } from 'types/animal';
import { createUrl } from './api_helpers';
import { API, ApiProps } from './api_interfaces';

export const critterbaseApi = (props: ApiProps): API => {
  const { api } = props;
  // const qc = useQueryClient();
  /**
   * retrieve the metadata history of an animal, given a @param id (critter_id)
   */
  const getSexOptions = async (): Promise<unknown[]> => {
    // const { data } = await api.get('/lookup');
    return [];
  };
  // const getRegionNrOptions = async (): Promise<unknown[]> => {
  //   // const { data } = await api.get('/lookup');
  // };
  // const getRegionEnvOptions = async (): Promise<unknown[]> => {
  //   // const { data } = await api.get('/lookup');
  // };

  return {
    getSexOptions
  };
};
