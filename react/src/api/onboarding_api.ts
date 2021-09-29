import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ApiProps } from 'api/api_interfaces';
import { submitOnboardingRequest as submitURL, getOnboardingRequests as getURL } from 'api/api_endpoint_urls';
import { IOnboardUser, HandleOnboardInput, OnboardUser } from 'types/onboarding';


export const onboardingApi = (props: ApiProps) => {
  const { api } = props;

  /**
   * from the requests page, when an unauthorized user submits a request 
   * to be granted access to BCTW
   */
  const submitOnboardingRequest = async (body: IOnboardUser): Promise<IOnboardUser> => {
    const url = createUrl({api: submitURL });
    console.log('posting new user to be onboarded', body);
    const { data } = await api.post(url, body);
    return data;
  }

  /**
   * 
   * @param body @type {IHandleOnboardRequestInput}
   * @returns a boolea depending on if the request was granted or denied.
   */
  const handleOnboardingRequest = async (body: HandleOnboardInput): Promise<boolean> => {
    const url = createUrl({api: submitURL});
    console.log('posting grant/deny onboard new user to be onboarded', body);
    const { data } = await api.post(url, body);
    return data;
  }

  /**
   * @returns retrieves existing (and granted/denied) onboarding requests
   * used in an admin only interface
   */
  const getOnboardingRequests = async (): Promise<IOnboardUser[]> => {
    const url = createUrl({api: getURL});
    const { data } = await api.get(url);
    return data.map((json: IOnboardUser) => plainToClass(OnboardUser, json));
  }

  return {
    getOnboardingRequests,
    handleOnboardingRequest,
    submitOnboardingRequest,
  };
};
