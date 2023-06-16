import 'styles/AppHeader.scss';

import { mdiAccountCircle, mdiAccountRemove, mdiHelpCircle, mdiProgressClock } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton } from '@mui/material';
import headerImage from 'assets/images/gov3_bc_logo.png';
import { urls } from 'constants/external_urls';
import { AlertContext } from 'contexts/UserAlertContext';
import { UserContext } from 'contexts/UserContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useContext, useState } from 'react';
import { TelemetryAlert } from 'types/alert';
import { User } from 'types/user';
import { AlertMenu } from '../alerts/AlertMenu';
import BCLogo from '../../assets/images/bcgov_logo.svg';

type AppheaderProps = {
  children?: JSX.Element;
};

const AppHeader = ({ children }: AppheaderProps): JSX.Element => {
  // load the contexts
  const useUser = useContext(UserContext);
  const useAlert = useContext(AlertContext);

  const [user, setUser] = useState<User>();
  const [telemetryAlerts, setTelemetryAlerts] = useState<TelemetryAlert[]>([]);
  //const [alertCount, setAlertCount] = useState(0);

  // when the UserContext is loaded, set the session info state
  useDidMountEffect(() => {
    const { user } = useUser;
    if (user) {
      setUser(user);
    }
  }, [useUser]);

  // toggle top navigation menu
  const topNavStyle = {
    display: user?.role_type ? 'inline' : 'none'
  };

  // toggle request access menu
  const requestAccessTopNavStyle = {
    display: user?.role_type ? 'none' : 'inline'
  };

  // when the AlertContext is loaded, set the alert state
  useDidMountEffect(() => {
    const { alerts } = useAlert;
    if (alerts.length) {
      setTelemetryAlerts(alerts);
    }
  }, [useAlert]);

  return (
    <header className={'app-header'}>
      <div className={'container'}>
        <a href='/home' className={'brand'} color={'inherit'}>
          {/* <img src={urls.bc_logo_url || headerImage} width={155} height={52} alt={'Government of British Columbia'} /> */}
          <img src={BCLogo} width={155} height={52} alt={'Government of British Columbia'} />
          BCTW
        </a>
        <nav id={'top-nav'} className={'app-nav'} style={topNavStyle}>
          <ul>
            <li>
              <a href='/home' color={'inherit'}>
                Home
              </a>
            </li>
            <li>
              <a href='/map' color={'inherit'}>
                Map
              </a>
            </li>
            <li>
              <a href='/manage' color={'inherit'}>
                Manage
              </a>
            </li>
            <li style={{ marginRight: 5 }}>
              <a href='/summary' color={'inherit'}>
                Summary
              </a>
            </li>
            <div className={'Beta-PhaseBanner'}>New</div>
          </ul>
        </nav>
        <nav id={'request-access-top-nav'} className={'app-nav'} style={requestAccessTopNavStyle}>
          <ul>
            <li>
              <a href='/onboarding' color={'inherit'}>
                Request Access
              </a>
            </li>
          </ul>
        </nav>
        <nav className='profile-nav'>
          <ul className={'header-ul'}>
            {/* Previous Alert Code */}
            {/* {alertCount > 0 && ENABLE_ALERTS ? (
              <li>
                <div className={'alerts'}>
                  <IconButton onClick={(): void => setShowAlerts((o) => !o)} disabled={!alertCount} size='large'>
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
            ) : null} */}
            {/* New Alert Code */}
            <AlertMenu alerts={telemetryAlerts} />
            <li className={'username'}>
              <a href='/profile'>
                <IconButton size='large'>
                  <Icon
                    path={user ? mdiAccountCircle : useUser.error ? mdiAccountRemove : mdiProgressClock}
                    className={'icon'}
                    title='User Profile'
                    size={1}
                  />
                </IconButton>
              </a>
              <a href='/profile'>
                <span color={'inherit'}>{user?.firstname ?? 'Guest'}</span>&nbsp;<span>{user?.lastname ?? 'User'}</span>
              </a>
            </li>
            <li className={'help'}>
              <a href={urls.bctw_support_url} target='_blank'>
                <IconButton size='large'>
                  <Icon path={mdiHelpCircle} className={'icon'} title='Help' size={1} />
                </IconButton>
              </a>
              <a href={urls.bctw_support_url} target='_blank'>
                <span color={'inherit'}>Help</span>
              </a>
            </li>
            <li className={'logout'}>
              <span>
                <a href='/logout'>
                  <span color={'inherit'}>Logout</span>
                </a>
              </span>
            </li>
            <li>{children}</li>
          </ul>
        </nav>
      </div>
      {/* Old alert modal. Has snooze functionality <Modal
        title={useAlert?.getAlertTitle()}
        open={showAlerts}
        handleClose={(): void => setShowAlerts(false)}
        useButton>
        <UserAlert />
      </Modal> */}
    </header>
  );
};

export default AppHeader;
