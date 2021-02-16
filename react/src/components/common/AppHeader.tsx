import { useContext, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';

// Icons
import Icon from '@mdi/react'
import { mdiAccountCircle  } from '@mdi/js'

// Assets
import 'styles/AppHeader.scss';
import headerImage from 'assets/images/gov3_bc_logo.png';
import { UserContext } from 'contexts/UserContext';
import { User } from 'types/user';

const AppHeader = (): JSX.Element => {
  const useUser = useContext(UserContext);
  const [user, setUser] = useState<User>(null);
  // const preventDefault = (event) => event.preventDefault();

  useEffect(() => {
    if (useUser.ready) {
      setUser(useUser.user);
    }
  }, [useUser])

  return (
    <header className={'app-header'}>
      <div className={'container'}>
        <Link href="/home" className={'brand'} color={'inherit'}>
          <img src={headerImage} width={155} height={52}
            alt={'Government of British Columbia'} />
          BCTW
        </Link>
        <nav className="profile-nav">
          <ul>
            <li>
              <div className={'username'}>
                <Icon path={ mdiAccountCircle }
                  title="User Profile"
                  size={1}>
                </Icon>
                <span>
                  {user?.idir ?? 'user name'}
                </span>
              </div>
            </li>
            <li>
              <Button
                className={'logout'}
                color="primary"
              >
                Log out
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
  
export default AppHeader;