import { useState } from 'react';
import axios, { AxiosInstance } from 'axios';
import { useMemo } from 'react';
import RequestUser from 'components/onboarding/Request';
import PendingUser from 'components/onboarding/Pending';
import DeniedUser from 'components/onboarding/Denied';
import ApprovedUser from 'components/onboarding/Approved';
import { getBaseUrl } from 'api/api_helpers';
import { userApi as user_api } from 'api/user_api';
import './AddUser.css';

/**
 * Returns an instance of axios with baseURL set.
 *
 * @return {AxiosInstance}
 */
const useApi = (): AxiosInstance => {
  const instance = useMemo(() => {
    return axios.create({
      baseURL: getBaseUrl()
    });
  }, []);
  return instance;
};

/**
 * # AddUser
 * This page displays one of four things depending on
 * the status of the IDIR/BCeID user
 * 1. Application for access form
 * 2. Pending access approval/denial
 * 3. Access denied
 * 4. Access approved
 */
const base = getBaseUrl();

const AddUser = (): JSX.Element => {
  const api = useApi();
  const userApi = user_api({ api });
  
  const [userAccess,setUserAccess] = useState(null);

  if (!userAccess) {
    userApi.getUser()
      .then((res) => {
        if (!res.error) setUserAccess(res.access) ;
      });
  }

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100vw'
  };

  // const onboardingStyle = {
  // };

  return (
    <div style={containerStyle}>
      {
        userAccess ? // User is in the system
          <div>
            {/* userAccess == "granted" ? <RequestUser/> : "" */}  {/*XXX for testing */}
            { userAccess == "granted" ? <ApprovedUser/> : ""}
            { userAccess == "pending" ? <PendingUser/> : "" }
            { userAccess == "denied" ? <DeniedUser/> : "" }
          </div>
        : <RequestUser/> // If here you're not in the system
      }
    </div>
  )
}
export default AddUser;
