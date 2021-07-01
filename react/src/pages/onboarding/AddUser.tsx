import RequestUser from 'components/onboarding/Request';
import PendingUser from 'components/onboarding/Pending';
import DeniedUser from 'components/onboarding/Denied';
import './AddUser.css';

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
