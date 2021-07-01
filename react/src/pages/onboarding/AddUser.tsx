import RequestUser from 'components/onboarding/Request';
import PendingUser from 'components/onboarding/Pending';
import DeniedUser from 'components/onboarding/Denied';
import './AddUser.css';

/**
 * # AddUser
 * This page displays one of three things depending on
 * the status of the IDIR/BCeID user
 * 1. Application for access form
 * 2. Pending access approval/denial
 * 3. Access denied
 */
const AddUser = (): JSX.Element => {
  return (
    <div>
      <RequestUser/>
      <PendingUser/>
      <DeniedUser/>
    </div>
  )
}
export default AddUser;
