import { useContext, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

// Icons
import Icon from '@mdi/react';
import { mdiAccountCircle, mdiAccountRemove, mdiProgressClock, mdiBell } from '@mdi/js';

// Assets
import 'styles/AppHeader.scss';
import headerImage from 'assets/images/gov3_bc_logo.png';
import { UserContext } from 'contexts/UserContext';
import { User } from 'types/user';
import { IconButton } from '@material-ui/core';
import { AlertContext } from 'contexts/UserAlertContext';
import UserAlert from 'pages/user/UserAlert';
import Modal from 'components/modal/Modal';

type AppheaderProps = {
  children?: JSX.Element;
};

const AppHeader = ({ children }: AppheaderProps): JSX.Element => {
  const useUser = useContext(UserContext);
  const [user, setUser] = useState<User>(null);
  const useAlert = useContext(AlertContext);
  const [alertCount, setAlertCount] = useState<number>(0);
  const [showAlerts, setShowAlerts] = useState<boolean>(false);

  useEffect(() => {
    if (useUser.ready) {
      setUser(useUser.user);
    }
  }, [useUser]);

  useEffect(() => {
    if (useAlert?.alerts?.length) {
      setAlertCount(useAlert.alerts.length);
    }
  }, [useAlert]);

  return (
    <header className={'app-header'}>
      <div className={'container'}>
        <Link to='/map' className={'brand'} color={'inherit'}>
          <img src={headerImage} width={155} height={52} alt={'Government of British Columbia'} />
          <p>BCTW</p>
        </Link>
        <nav className={'app-nav'}>
          <ul>
            <li>
              <Link to='/map' color={'inherit'}>
                Home
              </Link>
            </li>
            <li>
              <Link to='/data' color={'inherit'}>
                Manage
              </Link>
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
                <span>{user?.idir ?? 'user name'}</span>
              </div>
            </li>
            <li>
              <Button className={'logout'} color='primary'>
                Log out
              </Button>
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
