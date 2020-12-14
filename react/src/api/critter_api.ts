import { AxiosInstance } from "axios";
import { createUrl } from "api/api_helpers";
import { ICritterResults } from "./api_interfaces";

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


  return {
    getCritters,
    // linkCollar,
  }
}