import { AxiosInstance } from "axios";
import { createUrl } from "api/api_helpers";
import { ICollarLinkPayload, ICritterResults } from "./api_interfaces";
import { ICollarLinkResult } from "types/collar";
import { IAnimal } from "types/animal";

export const critterApi = (api: AxiosInstance) => {

  const getCritters = async (key: string, page = 1): Promise<ICritterResults> => {
    const apiStr = 'get-animals';
    const urlAssigned = createUrl({ api: apiStr, query: 'assigned=true', page });
    const urlAvailable = createUrl({ api: apiStr, query: 'assigned=false', page });
    console.log(`requesting critters ${urlAssigned}`);
    const results = await Promise.all([api.get(urlAssigned), api.get(urlAvailable)]);
    return {
      assigned: results[0]?.data,
      available: results[1]?.data
    };
  };

  const linkCollar = async (body: ICollarLinkPayload): Promise<ICollarLinkResult> => {
    const link = body.isLink ? 'link-animal-collar' : 'unlink-animal-collar';
    const url = createUrl({ api: link });
    console.log(`posting ${link}: ${JSON.stringify(body.data)}`);
    const { data } = await api.post(url, body);
    return data[0];
  };

  const upsertCritter = async (body: IAnimal[]): Promise<any> => {
    const url = createUrl({api: 'add-animal'});
    const { data } = await api.post(url, body);
    return data[0];
  }


  return {
    getCritters,
    linkCollar,
    upsertCritter,
  }
}