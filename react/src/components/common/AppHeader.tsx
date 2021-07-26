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
import { User } from 'types/user';

type AppheaderProps = {
  children?: JSX.Element;
};

const AppHeader = ({ children }: AppheaderProps): JSX.Element => {
  // load the contexts
  const useUser = useContext(UserContext);
  const useAlert = useContext(AlertContext);

  const [ user, setUser ] = useState<User>();
  const [alertCount, setAlertCount] = useState<number>(0);
  const [showAlerts, setShowAlerts] = useState<boolean>(false);

  // when the UserContext is loaded, set the session info state 
  useDidMountEffect(() => {
    const { user } = useUser;
    if (user) {
      setUser(user);
    }
  }, [useUser]);

  const topNavStyle = {
    display: user?.role_type ? 'inline' : 'inline'
  }

  const noAccessTopNavStyle = {
    display: user?.role_type ? 'inline' : 'inline'
  }

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
          BCTW
        </Link>
        <nav id={'top-nav'} className={'app-nav'} style={topNavStyle}>
          <ul>
            <li>
              <a href='/home' color={'inherit'}>Home</a>
            </li>
            <li>
              <a href='/map' color={'inherit'}>Map</a>
            </li>
            <li>
              <a href='/manage' color={'inherit'}>Manage</a>
            </li>
          </ul>
        </nav>
        <nav id={'no-access-top-nav'} className={'app-nav'} style={noAccessTopNavStyle}>
          <ul>
            <li>
              <a href='/onboarding' color={'inherit'}>Request Access</a>
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
                    path={user ? mdiAccountCircle : useUser.error ? mdiAccountRemove : mdiProgressClock}
                    className={'icon'}
                    title='User Profile'
                    size={1}
                  />
                </IconButton>
                <span>{user?.firstname ?? 'Local'}</span>&nbsp;<span>{user?.lastname ?? 'User'}</span>
              </div>
            </li>
            <li className={'logout'}>
              { /* XXX Victor test */}
              <a href='/logout'><span color={'inherit'}>Logout1</span></a> &nbsp;
              <Link to='/logout' color={'inherit'}>Logout2</Link>
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
