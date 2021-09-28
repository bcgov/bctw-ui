import axios, { AxiosInstance } from 'axios';
import UserAccessRequest from 'components/onboarding/Request';
import UserAccessPending from 'components/onboarding/Pending';
import UserAccessDenied from 'components/onboarding/Denied';
import UserAccessApproved from 'components/onboarding/Approved';
import { getBaseUrl } from 'api/api_helpers';
import { userApi as user_api } from 'api/user_api';
import { useMemo } from 'react';
import { useState } from 'react';
import './UserOnboarding.css';

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
 * # UserOnboarding
 * This page displays one of four things depending on
 * the status of the IDIR/BCeID user
 * 1. Application for access form
 * 2. Pending access approval/denial
 * 3. Access denied
 * 4. Access approved
 */
const base = getBaseUrl();

const UserOnboarding = (): JSX.Element => {
  const api = useApi();
  const userApi = user_api({ api });

  const [userAccess, setUserAccess] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  if (!userAccess) {
    userApi.getUser()
      .then((res) => {
        if (!res.error) {
            setUserEmail(res.email);
            setUserAccess(res.access);
        }
      });
  }

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100vw'
  };

  return (
    <div style={containerStyle}>
      <div>
        User's email is: {userEmail}
        User's access is: {userAccess}
      </div>
      {
        userAccess ? // User is in the system
          <div>
            {/* {userAccess == "granted" ? <UserAccessApproved /> : ""} */}
            {userAccess === "granted" ? <UserAccessRequest /> : ""}
            {userAccess === "pending" ? <UserAccessPending /> : ""}
            {userAccess === "denied" ? <UserAccessDenied /> : ""}
          </div>
          : <UserAccessRequest /> // If here you're not in the system
      }
    </div>
  )
}

export default UserOnboarding;