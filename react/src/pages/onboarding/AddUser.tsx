import { useState, createContext, useEffect, useContext } from 'react';
import { UserContext } from 'contexts/UserContext'
import RequestUser from 'components/onboarding/Request';
import PendingUser from 'components/onboarding/Pending';
import DeniedUser from 'components/onboarding/Denied';
import axios from 'axios';
import { getBaseUrl } from 'api/api_helpers';
import './AddUser.css';


/**
 * # AddUser
 * This page displays one of three things depending on
 * the status of the IDIR/BCeID user
 * 1. Application for access form
 * 2. Pending access approval/denial
 * 3. Access denied
 */
const AddUser = (): JSX.Element => {
  const useUser = useContext(UserContext);

  console.log(useUser);
  const [userAccess,setUserAccess] = useState({});

  if (useUser.ready) {
    const base = getBaseUrl();
    console.log('ready',base);
  }

  return (
    <div>
      {
        useUser.ready ?
          <div>
            <RequestUser/>
            <PendingUser/>
            <DeniedUser/>
          </div>
        : ''
      }
    </div>
  )
}
export default AddUser;
