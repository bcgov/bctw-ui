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
  const [userAccess,setUserAccess] = useState(null);

  if (useUser.ready && !userAccess) {
    const base = getBaseUrl();
    const domain = useUser.user.idir ? 'idir' : 'bceid'
    const user = useUser.user.idir ?
      useUser.user.idir :
      useUser.user.bceid
    /* This is the valid url */
    const url = `${base}/user-access?onboard-user=${user}&onboard-domain=${domain}&idir=${user}`;

    /* Testing a new user that hasn't applied yet */
    // const url = `${base}/user-access?onboard-user=testing&onboard-domain=${domain}&idir=${user}`;

    axios(url).then((res:any) => {
      setUserAccess(res.data.access);
    }).catch((err) => {
      console.error('error',err);
    })
  }

  return (
    <div>
      {
        useUser.ready && userAccess ?
          <div>
            <PendingUser/>
            <DeniedUser/>
          </div>
        : <RequestUser/>
      }
    </div>
  )
}
export default AddUser;
