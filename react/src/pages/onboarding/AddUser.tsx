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
const base = getBaseUrl();

const AddUser = (): JSX.Element => {
  // XXX: This is broken :(
  /**
   *  Need to hit the /api/session-info end point instead
   */
  // const useUser = useContext(UserContext);

  const [useUser, setUseUser] = useState(null);

  const authUrl = `${base}/api/session-info`;

  axios(authUrl).then((res:any) => {
    setUseUser(res.data);
    console.log('Got this from the session-info end point',res.data);
  }).catch((err) => {
    console.error('Could not get user keycloak info')
  })
  
  const [userAccess,setUserAccess] = useState(null);

  /**
   * If we have the user keycload data we can request
   * access info from the database.
   */
  if (useUser && !userAccess) {
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
      console.log('Got this from the user-access end point', res.data)
    }).catch((err) => {
      console.error('Could not get user access info',err);
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
        useUser && userAccess ? // User is in the system
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
