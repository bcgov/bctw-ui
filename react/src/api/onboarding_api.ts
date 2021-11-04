import { createUrl, postJSON } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { API, ApiProps } from 'api/api_interfaces';
import {
  getCurrentOnboardStatus,
  handleOnboardingRequest as handleURL,
  submitOnboardingRequest as submitURL,
  getOnboardingRequests as getURL
} from 'api/api_endpoint_urls';
import { IOnboardUser, HandleOnboardInput, OnboardUser, OnboardUserRequest } from 'types/onboarding';
import { useQueryClient } from 'react-query';

export const onboardingApi = (props: ApiProps): API => {
  const { api } = props;
  const queryClient = useQueryClient();

  const invalidate = (): void => {
    queryClient.invalidateQueries('user');
    queryClient.invalidateQueries('getOnboardRequests');
    queryClient.invalidateQueries('getOnboardStatus');
  };
  /**
   * from the requests page, when an unauthorized user submits a request
   * to be granted access to BCTW
   */
  const submitOnboardingRequest = async (body: OnboardUserRequest): Promise<IOnboardUser> => {
    // console.log('posting new user to be onboarded', body);
    const { data } = await postJSON(api, createUrl({ api: submitURL }), body);
    invalidate()
    return data;
  };

  /**
   *
   * @param body @type {IHandleOnboardRequestInput}
   * @returns a boolea depending on if the request was granted or denied.
   */
  const handleOnboardingRequest = async (body: HandleOnboardInput): Promise<boolean> => {
    // console.log('posting grant/deny onboard new user to be onboarded', body);
    const { data } = await postJSON(api, createUrl({ api: handleURL }), body);
    invalidate();
    return data;
  };

  /**
   * @returns retrieves existing (and granted/denied) onboarding requests
   * used in an admin only interface
   */
  const getOnboardingRequests = async (): Promise<IOnboardUser[]> => {
    const url = createUrl({ api: getURL });
    const { data } = await api.get(url);
    return data.map((json: IOnboardUser) => plainToClass(OnboardUser, json));
  };

  /**
   * unauthorized endpoint that retrieves the current status of a non-existing user's onboard status
   * returns null if api could not locate a status for this user
   * data will only have access, valid_from and valid_to properties, but
   * transform the object anyway in order to access class methods
   */
  const getOnboardStatus = async (): Promise<OnboardUser | null> => {
    const { data } = await api.get(createUrl({ api: getCurrentOnboardStatus }));
    return plainToClass(OnboardUser, data);
  };

  return {
    getOnboardStatus,
    getOnboardingRequests,
    handleOnboardingRequest,
    submitOnboardingRequest
  };
};
