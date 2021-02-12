import React from 'react';
import Link from '@material-ui/core/Link';
import 'styles/AppHeader.scss';
import headerImage from 'assets/images/gov3_bc_logo.png';

const AppHeader = (): JSX.Element => {

  const preventDefault = (event) => event.preventDefault();

  return (
    <header className={'app-header'}>
      <div className={'container'}>
        <Link href="/home" className={'brand'} color={'inherit'}>
          <img src={headerImage} width={155} height={52}
            alt={'Government of British Columbia'} />
          BCTW
        </Link>
      </div>
    </header>
  )
}
  
export default AppHeader;