import { useState, createContext, useEffect, useContext } from 'react';
import { UserContext } from 'contexts/UserContext'
import RequestUser from 'components/onboarding/Request';
import PendingUser from 'components/onboarding/Pending';
import DeniedUser from 'components/onboarding/Denied';
import ApprovedUser from 'components/onboarding/Approved';
import axios from 'axios';
import { getBaseUrl } from 'api/api_helpers';
import './AddUser.css';


/**
 * # AddUser
 * This page displays one of four things depending on
 * the status of the IDIR/BCeID user
 * 1. Application for access form
 * 2. Pending access approval/denial
 * 3. Access denied
 * 4. Access approved
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

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100vw'
  };

  const onboardingStyle = {
  };

  return (
    <div style={containerStyle}>
      {
        useUser.ready && userAccess ? // User is in the system
          <div>
            {/* userAccess == "granted" ? <DeniedUser/> : "" */}  {/*XXX for testing */}
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
