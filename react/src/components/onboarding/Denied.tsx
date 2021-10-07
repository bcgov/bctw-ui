import Icon from '@mdi/react';
import { mdiAlertCircleOutline, mdiCloseBox } from '@mdi/js';
import { IconButton } from '@material-ui/core';
import { OnboardUser } from 'types/onboarding';
import './style.css';
import { formatDay } from 'utils/time';

type UserAccessDeniedProps = { onboard: OnboardUser };
const UserAccessDenied = ({ onboard }: UserAccessDeniedProps): JSX.Element => {
  return (
    <div className='onboarding-container'>
      <div className='icon'>
        <Icon path={mdiAlertCircleOutline} size={2} color='red' className='icon'></Icon>
      </div>
      <div className='title'>
        <h2>Request Denied</h2>
      </div>
      <div className='description'>You do not have permission to access this site</div>
      {onboard ? (
        <>
          <div>Your request submitted on {onboard.valid_from.format(formatDay)} was denied</div>
          <div>You can submit a new request on {onboard.valid_from.add(7, 'day').format(formatDay)}</div>
        </>
      ) : null}

      <IconButton color='secondary'>
        <a href='/logout#/logout'>
          <Icon path={mdiCloseBox} size={1}></Icon>
          Log Out
        </a>
      </IconButton>
    </div>
  );
};
export default UserAccessDenied;
