import Icon from '@mdi/react';
import { mdiAlertCircleOutline, mdiCloseBox } from '@mdi/js';
import { IconButton } from '@material-ui/core';
import './style.css';

const UserAccessDenied = (): JSX.Element => {
  return (
    <div className='onboarding-container'>
      <div className='icon'>
        <Icon
          path={mdiAlertCircleOutline}
          size={2}
          color='red'
          className="icon"
        ></Icon>
      </div>
      <div className='title'>
        <h2>Request Denied</h2>
      </div>
      <div className='description'>You do not have permission to access this site</div>

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
export default UserAccessDenied;
