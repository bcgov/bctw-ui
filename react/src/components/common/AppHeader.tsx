import 'styles/AppHeader.scss';

import { IconButton } from '@material-ui/core';
import { mdiAccountCircle, mdiAccountRemove, mdiBell, mdiProgressClock } from '@mdi/js';
import Icon from '@mdi/react';
import headerImage from 'assets/images/gov3_bc_logo.png';
import Modal from 'components/modal/Modal';
import { AlertContext } from 'contexts/UserAlertContext';
import { UserContext } from 'contexts/UserContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import UserAlert from 'pages/user/UserAlertPage';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { IKeyCloakSessionInfo } from 'types/user';

type AppheaderProps = {
  children?: JSX.Element;
};

const AppHeader = ({ children }: AppheaderProps): JSX.Element => {
  // load the contexts
  const useUser = useContext(UserContext);
  const useAlert = useContext(AlertContext);

  const [session, setSession] = useState<IKeyCloakSessionInfo>(null);
  const [alertCount, setAlertCount] = useState<number>(0);
  const [showAlerts, setShowAlerts] = useState<boolean>(false);

  // when the UserContext is loaded, set the session info state 
  useDidMountEffect(() => {
    if (useUser.session) {
      setSession(useUser.session);
    }
  }, [useUser]);

  // when the AlertContext is loaded, set the alert state
  useDidMountEffect(() => {
    if (useAlert?.alerts?.length) {
      setAlertCount(useAlert.alerts.length);
    }
  }, [useAlert]);

  return (
    <header className={'app-header'}>
      <div className={'container'}>
        <Link to='/' className={'brand'} color={'inherit'}>
          <img src={headerImage} width={155} height={52} alt={'Government of British Columbia'} />
          <p>BCTW</p>
        </Link>
        <nav className={'app-nav'}>
          <ul>
            <li>
              <Link to='/home' color={'inherit'}>Home</Link>
            </li>
            <li>
              <Link to='/map' color={'inherit'}>Map</Link>
            </li>
            <li>
              <Link to='/manage' color={'inherit'}>Manage</Link>
            </li>
          </ul>
        </nav>
        <nav className='profile-nav'>
          <ul className={'header-ul'}>
            {alertCount > 0 ? (
              <li>
                <div className={'alerts'}>
                  <IconButton onClick={(): void => setShowAlerts((o) => !o)} disabled={!alertCount}>
                    <Icon
                      path={mdiBell}
                      color={alertCount ? 'red' : 'white'}
                      className={'icon'}
                      title='User Alerts'
                      size={1}
                    />
                    {alertCount}
                  </IconButton>
                </div>
              </li>
            ) : null}
            <li>
              <div className={'username'}>
                <IconButton component={Link} to='/profile'>
                  <Icon
                    path={useUser.ready ? mdiAccountCircle : useUser.error ? mdiAccountRemove : mdiProgressClock}
                    className={'icon'}
                    title='User Profile'
                    size={1}
                  />
                </IconButton>
                <span>{session?.given_name?? 'Local'}</span>&nbsp;<span>{session?.family_name?? 'User'}</span>
              </div>
            </li>
            <li className={'logout'}>
              <Link to='/logout' color={'inherit'}>Logout</Link>
            </li>
            <li>{children}</li>
          </ul>
        </nav>
      </div>
      <Modal title={`Alerts (${alertCount})`} open={showAlerts} handleClose={(): void => setShowAlerts(false)}>
        <UserAlert />
      </Modal>
    </header>
  );
};

export default AppHeader;
