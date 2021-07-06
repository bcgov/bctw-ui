import Icon from '@mdi/react';
import { mdiCheckBold, mdiCloseBox } from '@mdi/js';
import { IconButton } from '@material-ui/core';
import './style.css';

const PendingUser = (): JSX.Element => {
  return (
    <div className='onboarding-container'>
      <div className='icon'>
        <Icon
          path={mdiCheckBold}
          size={2}
          color='#64dd17'
          className="icon"
        ></Icon>
      </div>
      <div className='title'>
        <h2>Request Submitted</h2>
      </div>
      <div className='description'>Your request has been submitted for review</div>

      <IconButton color="secondary">
        <a href='/logout#/logout'>
          <Icon
            path={mdiCloseBox}
            size={1}
          ></Icon>
          Log Out
        </a>
      </IconButton>
    </div>
  )
}
export default PendingUser;
