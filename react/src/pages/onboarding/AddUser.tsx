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

  // TODO Exit out if userAccess already exists
  if (useUser.ready) {
    const base = getBaseUrl();
    const domain = useUser.user.idir ? 'idir' : 'bceid'
    const user = useUser.user.idir ?
      useUser.user.idir :
      useUser.user.bceid
    const url = `${base}/user-access?onboard-user=${user}&onboard-domain=${domain}&idir=${user}`
    console.log('url',url)
    axios(url).then((res:any) => {
      console.log(res.data);
    }).catch((err) => {
      console.error('error',err);
    })
    console.log('ready',url);
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
